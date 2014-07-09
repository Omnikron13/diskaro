//require_once(CrockfordSugar.js)
//require_once(Label.js)

function Release(json) {
    this.id = json.id;
    this.name = json.name;
    this.year = json.year;
    this.label = json.label===null?null:new Label(json.label);
};
