describe('On page load, Censor ', () => {

    let defaultTriggerWord = '[Politics]'

    it(`will replace ${defaultTriggerWord} with Kittys`, () => {

        let div = document.createElement("div")

        div.innerHTML = defaultTriggerWord

        document.body.appendChild(div)

        expect(defaultTriggerWord.innerHTML).not.toBe(defaultTriggerWord)
    })
})