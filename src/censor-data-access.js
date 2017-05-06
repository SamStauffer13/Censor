export class CensorDataAccess {

    constructor() {

        this.CensorStatusKey = "CensorStatusKey";
        this.CensorTriggerWarningKey = "CensorTriggerWarningKey";
        this.CensorDebaucheryKey = "CensorDebaucheryKey";
        this.defaultTriggerWarnings = ['[politics]'];
        this.defaultDebauchery = { "sam stauffer": "༼ つ ◕_◕ ༽つ" };
    }

    // todo this pattern could be abstracted
    getTriggerWarnings() {

        let triggerWarnings = localStorage.getItem(this.CensorTriggerWarningKey);

        if (triggerWarnings === null || triggerWarnings === '' || triggerWarnings === 'null') return this.defaultTriggerWarnings;

        return triggerWarnings.split(',');
    }

    getDebauchery() {

        let debauchery = localStorage.getItem(this.CensorDebaucheryKey);
        if (debauchery === null || debauchery === '' || debauchery === 'null') return this.defaultDebauchery;

        try {

            return JSON.parse(debauchery);

        } catch (e) {

            console.error('unable to parse ', debauchery, e)

            localStorage.clear();

            return this.defaultDebauchery;
        }
    }

    updateTriggerWarnings(triggerWarnings) {

        localStorage.setItem(this.CensorTriggerWarningKey, triggerWarnings);
    }

    updateDebauchery(debauchery) {

        localStorage.setItem(this.CensorDebaucheryKey, JSON.stringify(debauchery));
    }

    isCensorEnabled() {

        let status = localStorage.getItem(this.CensorStatusKey);

        if (status === null || status === '' || status === 'true') return true;

        return false;
    }

    updateCensorStatus(isEnabled) {

        localStorage.setItem(this.CensorStatusKey, isEnabled);
    }
}