
/*
    Defining namespace for Trello app
*/

const trelloApp = {

    /*
        ------------------------------------


        Util functions 


        ------------------------------------
    */ 


    /*
        Adds new task element to the appropriate container 
        Parameters: 
            cardName: backlog, in-progress, complete, on-hold
            taskName: read from input
    */
    addItemToContainer: (cardName, taskName) => {

        let div = document.createElement('div')
        div.innerText = `${taskName}`
        div.setAttribute("draggable", "true")
        div.classList.add("new-item")

        const holderSpace = [...document.getElementById(`items-container-${cardName}`).children].pop()
        document.getElementById(`items-container-${cardName}`).insertBefore(div, holderSpace)

        div.addEventListener('dragstart', () => {
            div.classList.add('dragging')
        })

        div.addEventListener('dragend', () => {

            div.classList.remove('dragging')
            trelloApp.saveSnapshot()
        })

    },

    /*
        addItem is triggered when user clicks on "add" button
        - Disabling addition of empty tasks
        - Reading input value and saving it to the page and local storage
    */ 
    addItem: (cardName) => {

        document.getElementById(`input-box-${cardName}`).classList.add("not-visible")
        document.getElementById(`add-item-${cardName}`).classList.remove("not-visible")
        
        let inputValue = document.getElementById(`input-item-${cardName}`).value
        if(inputValue == "") {

        alert("You can't insert empty item!")
        return
        }
        
        trelloApp.addItemToContainer(cardName, inputValue)
        let cardStorage = window.localStorage.getItem(cardName)
        if (cardStorage === "")
            cardStorage = [inputValue]
        else {

            cardStorage =  cardStorage.split(",")
            cardStorage.push(inputValue)
        }   

        window.localStorage.setItem(cardName, cardStorage)
    },

    /*
        Triggered when user click on "+ Add item"
    */
    addItemToggleClass: (cardName) => {

        document.getElementById(`input-box-${cardName}`).classList.remove("not-visible")
        document.getElementById(`add-item-${cardName}`).classList.add("not-visible")
        document.getElementById(`input-item-${cardName}`).value = ""
        document.getElementById(`input-item-${cardName}`).focus()
    },

    /*
        Finds what are current tasks in specific card 
        Parameters:
            cardName: backlog, in-progress, complete, on-hold
    */
    cardActiveItems: (cardName) => {

        const card = [...document.getElementById(`items-container-${cardName}`).children].slice(1,-1)
        const cardItems = []
        card.forEach( (element) => cardItems.push(element.innerText) )

        return cardItems
    } ,

    /*
        Returns what are active items in different cards
    */
    takeSnapshot: () => {

        return [
            trelloApp.cardActiveItems("backlog"),
            trelloApp.cardActiveItems("in-progress"),
            trelloApp.cardActiveItems("complete"),
            trelloApp.cardActiveItems("on-hold")
        ]
    },

    /*
        Save current card items into localStorage
    */
    saveSnapshot: () => {

        [backlog, inProgress, complete, onHold] = trelloApp.takeSnapshot()

        window.localStorage["backlog"] = backlog 
        window.localStorage["in-progress"] = inProgress
        window.localStorage["complete"] = complete 
        window.localStorage["on-hold"] = onHold 
    },

    /*
        ------------------------------------


        On load 


        ------------------------------------
    */ 

    start: () => {

        const storage = window.localStorage
        if (!storage.getItem("backlog"))
            storage.setItem("backlog", "")
        else 
            storage.getItem("backlog").split(",").forEach( (task) => {
                trelloApp.addItemToContainer("backlog", task)
            })
        if (!storage.getItem("in-progress"))
            storage.setItem("in-progress", "")
        else 
            storage.getItem("in-progress").split(",").forEach( (task) => {
                trelloApp.addItemToContainer("in-progress", task)
            })
        if (!storage.getItem("complete"))
            storage.setItem("complete", "")
        else 
            storage.getItem("complete").split(",").forEach( (task) => {
                trelloApp.addItemToContainer("complete", task)
            })
        if (!storage.getItem("on-hold"))
            storage.setItem("on-hold", "")
        else 
            storage.getItem("on-hold").split(",").forEach( (task) => {
                trelloApp.addItemToContainer("on-hold", task)
            })
    },

    /*
        ------------------------------------


        Event listeners 


        ------------------------------------
    */ 

    addEventListeners: () => {

        document.getElementById("add-item-backlog").addEventListener("click", () => {

            trelloApp.addItemToggleClass("backlog")
        })
    
        document.getElementById("add-item-in-progress").addEventListener("click", () => {
    
            trelloApp.addItemToggleClass("in-progress")
        })
    
        document.getElementById("add-item-complete").addEventListener("click", () => {
    
            trelloApp.addItemToggleClass("complete")
        })
    
        document.getElementById("add-item-on-hold").addEventListener("click", () => {
    
            trelloApp.addItemToggleClass("on-hold")
        })
    
        /*
            Adding eventlistener when clicking on "Add" for different card containers
        */ 
        document.getElementById("add-button-backlog").addEventListener("click", () => {
    
            trelloApp.addItem("backlog")
        })
    
        document.getElementById("add-button-in-progress").addEventListener("click", () => {
    
            trelloApp.addItem("in-progress")
        })
    
        document.getElementById("add-button-complete").addEventListener("click", () => {
    
            trelloApp.addItem("complete")
        })
    
        document.getElementById("add-button-on-hold").addEventListener("click", () => {
    
            trelloApp.addItem("on-hold")
        })

        /*
            Event listeners for dragstart, dragend and dragover
        */
        setTimeout(() => {

            let draggables = document.querySelectorAll('.new-item')
            let container = document.querySelectorAll('.items-container')

            draggables.forEach(dragable => {

                dragable.addEventListener('dragstart', () => {
                    dragable.classList.add('dragging')
                })
            
                dragable.addEventListener('dragend', () => {

                    dragable.classList.remove('dragging')
                    trelloApp.saveSnapshot()
                })
            })

            function getDragAfterElement(container, y) {

                const draggableElements = [...container.querySelectorAll('.new-item:not(.dragging')]

                let closestElement = draggableElements[0]
                let closestDifference = Number.POSITIVE_INFINITY
                draggableElements.forEach( (element) => {
                    const box = element.getBoundingClientRect()
                    const difference = Math.abs(y - box.top - box.height / 2)
                    if (difference <= closestDifference) {
                        closestElement = element 
                        closestDifference = difference
                    }
                } )

                return closestElement
            }

            container.forEach(container => {
                
                container.addEventListener('dragover', e => {

                    e.preventDefault()
                    const afterElement = getDragAfterElement(container, e.clientY)
                    const draggable = document.querySelector('.dragging')
                    if(afterElement == undefined) {
                        const holderSpace = [...container.children].pop()
                        container.insertBefore(draggable, holderSpace)
                    } else {
                        container.insertBefore(draggable, afterElement)
                    }
                })
            })
        }, 1000)
    }
}

window.onload = trelloApp.start
trelloApp.addEventListeners()