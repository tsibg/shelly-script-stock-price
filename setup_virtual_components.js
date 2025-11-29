/**
 * SETUP SCRIPT: Stock Monitor Components
 * 
 * 1. Define configuration (Icons, Group Config, Components).
 * 2. Script creates them sequentially.
 * 3. Creates a Group and adds them.
 */

// CONFIGURATION
// Using white icons from material-icons.github.io (confirmed working)
const ICONS = {
  group: "https://material-icons.github.io/material-icons-png/png/white/show_chart/baseline.png",
  text:  "https://material-icons.github.io/material-icons-png/png/white/text_fields/baseline.png",
  money: "https://material-icons.github.io/material-icons-png/png/white/euro_symbol/baseline.png",
  clock: "https://material-icons.github.io/material-icons-png/png/white/access_time/baseline.png"
};

const CONFIG = {
  group: {
    name: "Stock Monitor",
    icon: ICONS.group
  },
  components: [
    { key: "symbol", type: "text",   name: "Stock Symbol", view:"field", icon: ICONS.text, unit: null,  default: "SLYG.DE" },
    { key: "price", type: "number", name: "Current Price",icon: ICONS.money, unit: "EUR", default: 0 },
    { key: "time", type: "text",   name: "Last Updated", icon: ICONS.clock, unit: null,  default: "never" },
  ]
};

function stopScript() {
  Shelly.call('Script.Stop', {id: Shelly.getCurrentScriptId()});
}

const Setup = {
  createdComponents: {},

  createNextComponent: function(index, onComplete) {
    if (index >= CONFIG.components.length) {
      Setup.createGroup(onComplete);
      return;
    }

    let comp = CONFIG.components[index];
    Setup.createVirtualComponent(comp, function(id) {
      if (id) Setup.createdComponents[comp.key] = id;
      Setup.createNextComponent(index + 1, onComplete);
    });
  },

  createVirtualComponent: function(def, callback) {
    let config = {
      name: def.name,
      meta: { ui: { view: def.view || "label", icon: def.icon } }
    };

    if (def.unit) config.meta.ui.unit = def.unit;
    if (def.default !== null) config.default_value = def.default;

    Shelly.call("Virtual.Add", { type: def.type, config: config }, function(res, err, errMsg) {
      if (err !== 0) {
          print("Error creating", def.name, errMsg);
          callback(null);
          return;
      }
      if (res && res.id) {
        const fullId = def.type + ":" + res.id;
        print("Created '" + def.name + "' ->", fullId);
        callback(fullId);
      } else {
        print("Error creating", def.name, "No ID returned");
        callback(null);
      }
    });
  },

  createGroup: function(onComplete) {
    const config = {
      name: CONFIG.group.name,
      meta: { ui: { icon: CONFIG.group.icon } }
    };

    Shelly.call("Virtual.Add", { type: "group", config: config }, function(res) {
      if (res && res.id) {
        print("Created Group ->", res.id);
        
        // Link children
        let childIds = [];
        for (let i = 0; i < CONFIG.components.length; i++) {
          let key = CONFIG.components[i].key;
          if (Setup.createdComponents[key]) {
            childIds.push(Setup.createdComponents[key]);
          }
        }

        Shelly.call("Group.Set", { id: res.id, value: childIds }, function() {
          Setup.printSummary();
          if (onComplete) onComplete();
        });
      } else {
        print("Error creating Group");
        if (onComplete) onComplete();
      }
    });
  },

  printSummary: function() {
    print("------------------------------------------------");
    print("SETUP COMPLETE!");
    print("Copy these IDs for your main script:");
    
    for (let key in Setup.createdComponents) {
      print(key + "_id: \"" + Setup.createdComponents[key] + "\",");
    }
    print("------------------------------------------------");
  },
};

/**
 * CLEANUP FUNCTION
 * 
 * Call this function manually to remove ALL virtual components.
 * It is not part of the Setup object to avoid accidental execution.
 */
function cleanupAllComponents(onComplete) {
  print("Scanning for existing virtual components...");
  
  // Use RPC call to get components list
  Shelly.call("Shelly.GetComponents", { dynamic_only: true }, function(res) {
    if (!res || !res.components) {
      print("Failed to fetch components list.");
      if (onComplete) onComplete();
      return;
    }

    let components = res.components;
    let idsToDelete = [];

    for (let i = 0; i < components.length; i++) {
      let key = components[i].key;
      idsToDelete.push(key);
    }

    if (idsToDelete.length === 0) {
      print("No virtual components found.");
      if (onComplete) onComplete();
      return;
    }


    print("Found " + idsToDelete.length + " components to delete. Starting cleanup...");

    // Recursive delete function
    function deleteNext(index) {
      if (index >= idsToDelete.length) {
        print("Cleanup commands sent.");
        if (onComplete) onComplete();
        return;
      }

      let key = idsToDelete[index];
      print("Deleting Key:", key);
      
      Shelly.call("Virtual.Delete", { key: key }, function(res, err, errMsg) {
         if (err !== 0) {
             print("Error deleting key:", key, errMsg);
         } else {
             print("Deleted key:", key);
         }
         deleteNext(index + 1);
      });
    }

    // Start recursion
    deleteNext(0);
  });
}


// To cleanup all virtual components, uncomment the line below:
// cleanupAllComponents(stopScript);
// Start creation
Setup.createNextComponent(0, stopScript);