export default class TimeGroup {
    constructor() {
      this.groups ={};
    }
    addGroup(group, obj){
        this.groups[group]= {
            "quotas":{
                "qt1":0,
                "qt2":0,
                "qt3":0,
                "qt4":0,
                "qt5":0,
                "qt6":0,
                "qt7":0,
                "qt8":0
            },
            "quotasBooked":{
                "qt1Booked":0,
                "qt2Booked":0,
                "qt3Booked":0,
                "qt4Booked":0,
                "qt5Booked":0,
                "qt6Booked":0,
                "qt7Booked":0,
                "qt8Booked":0
            },
              "title":"",
            "group":group
        };
        Object.assign(this.groups[group], obj);
    }
    addQuota(group, qt, qtNum, qtBooked){
        qtNum = qtNum || 0;
        qtBooked = qtBooked || 0;
        this.groups[group]['quotas'][qt] += qtNum;
        this.groups[group]['quotasBooked'][qt + "Booked"] += qtBooked;
    }
    _setTitle(group, title){
        if(title){
            this.groups[group]['title'] = title;
        }
    }
    updateTitle(){
        let groups = this.groups;
        Object.keys( groups ).forEach(function(groupKey){
            let s = "";
            let quotas = groups[groupKey]['quotas'];
            Object.keys( quotas ).forEach(function(quotaKey){
                if (quotas[quotaKey]){
                    s += quotaKey + ": " + quotas[quotaKey] + " ";
                }
            });
            this._setTitle(groupKey, s);
        }.bind(this));
    }
    getSchedules(){
        let scheudules = [];
        let groups = this.groups;
        Object.keys( groups ).forEach(function(groupKey){
            if(groupKey == "quotas"){ return; }
            scheudules.push(groups[groupKey]);
        });
        return scheudules;
    }
}

