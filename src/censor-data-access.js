export class CensorDataAccess {
    constructor() {
        this.censorStatusKey = "CensorStatusKey";
        this.triggerWarningsKey = "CensorTriggerWarnings";
        this.defaultTriggerWarnings = {
            "politics": "kittens"           
        }
    }
    isCensorEnabled() {
        const status = localStorage.getItem(this.censorStatusKey)
        return status === null || status === '' || status === 'true'
    }
    updateCensorStatus(isEnabled) {
        console.log('setting auto run to', isEnabled)
        localStorage.setItem(this.censorStatusKey, isEnabled)
    }
    getTriggerWarnings() {
        let triggerWarnings = localStorage.getItem(this.triggerWarningsKey)
        if (triggerWarnings == null || triggerWarnings == '' || triggerWarnings == undefined) return this.defaultTriggerWarnings;
        try {
            console.log("reading: ", triggerWarnings) 
            return JSON.parse(triggerWarnings) || {}
        } catch (e) {
            console.error('unable to parse ', triggerWarnings, e)
            localStorage.removeItem(this.triggerWarningsKey)
            return this.defaultTriggerWarnings
        }
    }
    updateTriggerWarnings(triggerWarnings) {
        let str = JSON.stringify(triggerWarnings)
        console.log("writing: ", str )
        if (triggerWarnings === '') localStorage.removeItem(this.triggerWarningsKey)
        else localStorage.setItem(this.triggerWarningsKey, str)
    }
}