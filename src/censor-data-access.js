export class CensorDataAccess {
    constructor() {
        this.censorStatusKey = "CensorStatusKey";
        this.triggerWarningsKey = "CensorTriggerWarnings";
        this.defaultTriggerWarnings = {
            "political post": "kittens"            
        }
    }
    isCensorEnabled() {
        const status = localStorage.getItem(this.censorStatusKey)
        return status === null || status === '' || status === 'true'
    }
    updateCensorStatus(isEnabled) {
        localStorage.setItem(this.censorStatusKey, isEnabled)
    }
    getTriggerWarnings() {

        // todo, figure what is corrupting localstorage
        return this.defaultTriggerWarnings;
        // let triggerWarnings = localStorage.getItem(this.triggerWarningsKey)
        // if (triggerWarnings == null || triggerWarnings == '' || triggerWarnings == undefined) return this.defaultTriggerWarnings;
        // try {
        //     return JSON.parse(triggerWarnings) || {}
        // } catch (e) {
        //     console.error('unable to parse ', triggerWarnings, e)
        //     localStorage.removeItem(this.triggerWarningsKey)
        //     return this.defaultTriggerWarnings
        //}
    }
    updateTriggerWarnings(triggerWarnings) {
        let str = JSON.stringify(triggerWarnings)
        if (triggerWarnings === '') localStorage.removeItem(this.triggerWarningsKey)
        else localStorage.setItem(this.triggerWarningsKey, str)
    }
}