const { UISettings } = require('./uisettings');
const { TaskModuleIds } = require('./taskmoduleids');

const TaskModuleUIConstants = {
    Loom: new UISettings(1000, 700, 'Loom video test', TaskModuleIds.Loom, 'Loom'),
};

module.exports.TaskModuleUIConstants = TaskModuleUIConstants;