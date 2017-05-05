
export class CensorDataAccess {

    constructor() {

        this.CensorStatusKey = "CensorStatusKey";
        this.CensorTriggerWarningKey = "CensorTriggerWarningKey";
        this.CensorDebaucheryKey = "CensorDebaucheryKey";
        this.defaultTriggerWarnings = ['[politics]'];
        this.defaultDebauchery = { "sam stauffer": "༼ つ ◕_◕ ༽つ" };
    }

    // todo this pattern could be abstracted
    GetTriggerWarnings() {

        let triggerWarnings = localStorage.getItem(this.CensorTriggerWarningKey);

        if (triggerWarnings === null || triggerWarnings === '' || triggerWarnings === 'null') return this.defaultTriggerWarnings;

        return triggerWarnings.split(',');
    }

    GetDebauchery() {

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

    UpdateTriggerWarnings(triggerWarnings) {

        localStorage.setItem(this.CensorTriggerWarningKey, triggerWarnings);
    }

    UpdateDebauchery(debauchery) {

        localStorage.setItem(this.CensorDebaucheryKey, JSON.stringify(debauchery));
    }

    IsCensorEnabled() {

        let status = localStorage.getItem(this.CensorStatusKey);

        if (status === null || status === '' || status === 'true') return true;

        return false;
    }

    UpdateCensorStatus(isEnabled) {

        localStorage.setItem(this.CensorStatusKey, isEnabled);
    }
}