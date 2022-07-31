/* =============================_Variable_============================= */
// toolbox 
let add_btn = document.querySelector(".add-btn");
let remove_btn = document.querySelector(".remove-btn");
let toolbar_color = document.querySelectorAll(".color");

// main container
let main_cont = document.querySelector(".main-cont");

// modal container
let modal_cont = document.querySelector(".modal-cont");
let text_area = document.querySelector(".text-area");
let priority_color = document.querySelectorAll(".priority-color");


let colors = ["light-blue", "light-green", "light-pink", "black"]; // store priority color in array
let modal_priority_color = colors[colors.length - 1]; // make black to default color 
let ticket_obj = []; // where we store created ticket 
let ticket_id_map = []; // store ticket id to check id is present or not

let add_flag = false; // to toggle add button
let remove_flag = false; // to toggle remove button
let lock_flag = true; // to toggle lock to unlock and unclock to lock


/*
    reload => visible ticket
*/ 
if(localStorage.getItem("JIRA_TICKET")) {
    /* retrive and display ticket */ 
    ticket_obj = JSON.parse(localStorage.getItem("JIRA_TICKET"));
    ticket_obj.forEach((ticket) => {
        createTicket(ticket.ticket_color, ticket.ticket_id, ticket.task);
    })
}

/* ==========================================_ADD EVENT LISTENER_========================================== */
/* 
    1. click Listener to add in add button
    => on clicking add button, modal will open
*/
add_btn.addEventListener("click", (e) => {
    /*
        1. display modal
        add_flag = true -> modal display
        add_flag = false -> modal none
    */
    add_flag = !add_flag;
    if (add_flag == true) {
        modal_cont.style.display = "flex";
    } else {
        modal_cont.style.display = "none";
    }
})


/*
    2. click listener add in remove button
    => to toggle remove btn on clicking
*/
remove_btn.addEventListener("click", (e) => {
    remove_flag = !remove_flag;
})

/*
    3. click listener add to ticket color
    => select color and add border on click on ticket color 
*/
priority_color.forEach((colorElem) => {
    colorElem.addEventListener("click", (e) => {
        priority_color.forEach((eachColorElem) => {
            eachColorElem.classList.remove("border");
        })
        colorElem.classList.add("border");
        modal_priority_color = colorElem.classList[0];
    })
})

/*
    4. click listener add to generate ticket
    => on shift press, ticket will generate which contains ticket color, unique id and task which we written
*/
modal_cont.addEventListener("keydown", (e) => {
    let key = e.key;
    if (key === "Shift") {
        let ticket_color = modal_priority_color;
        let ticket_id = shortid();
        let task = text_area.value;
        createTicket(ticket_color, ticket_id, task);

        // to get default state of text area
        modalDefaultState();

        modal_cont.style.display = "none"; // also make modal to display => none
        add_flag = !add_flag; // toggle add_btn mode
    }
})

/*
    5. click listener add to toolbar color
    => functionality of single clik and double click 
*/ 
toolbar_color.forEach((color) => {

    // => on single clicking, filter the ticket on the basis of priority color given
    color.addEventListener("click", (e) => {
        let filteredTicket = ticket_obj.filter((ticket) => {
            let ticket_color = ticket.ticket_color;
            return color.classList[0] == ticket_color;
        })
        
        // remove all ticket
        let allTicketCont = document.querySelectorAll(".ticket-cont");
        allTicketCont.forEach((ticket) => {
            ticket.remove();
        })

        // filter a/c to selected color and display
        filteredTicket.forEach((ticket) => {
            createTicket(ticket.ticket_color, ticket.ticket_id, ticket.task);
        })
    })

    // => on double clicking, display all the ticket
    color.addEventListener("dblclick", (e) => { 
        // remove visible ticket
        let allTicketCont = document.querySelectorAll(".ticket-cont");
        allTicketCont.forEach((ticket) => {
            ticket.remove();
        })

        // display all ticket
        ticket_obj.forEach((ticket) => {
            createTicket(ticket.ticket_color, ticket.ticket_id, ticket.task);
        })
    })
})


/* ==========================================_FUNCTION_========================================== */
// function to create ticket
function createTicket(ticket_color, ticket_id, task) {
    let id = ticket_id || shortid();
    let ticket_cont = document.createElement("div");
    ticket_cont.setAttribute("class", "ticket-cont");
    ticket_cont.innerHTML = `
        <div class="ticket-color ${ticket_color}"></div>
        <div class="ticket-id">#${id}</div>
        <div class="task-cont" spellcheck="false">${task}</div>
        <div class="lock">
                <i class="fa-solid fa-lock"></i>
            </div>
    `
    main_cont.appendChild(ticket_cont); // append ticket_container(HTML) to main container

    // Create object of ticket and add to array
    if (!ticket_id) {
        ticket_obj.push({ ticket_color, ticket_id: id, task});
        localStorage.setItem("jira_tickets", JSON.stringify(ticket_obj));
    }

    /* ==============_HANDLE_============== */ 
    handleToggleLock(ticket_cont, ticket_id);
    handleRemoveBtn(ticket_cont);
    handleColor(ticket_cont, ticket_id);
}

// function to handle toggle lock
function handleToggleLock(ticket_cont, ticket_id) {
    let key_elem = ticket_cont.querySelector(".fa-lock");
    let task_cont = ticket_cont.querySelector(".task-cont");

    // listener to toggle lock key
    key_elem.addEventListener("click", (e) => {
        let ticketIdx = getTicketIdx(ticket_id);
        lock_flag = !lock_flag;
        if (lock_flag == false) {
            // unlock the key
            key_elem.classList.remove("fa-lock");
            key_elem.classList.add("fa-unlock");
            task_cont.setAttribute("contenteditable", "true");
        } else {
            // lock
            key_elem.classList.remove("fa-unlock");
            key_elem.classList.add("fa-lock");
            task_cont.setAttribute("contenteditable", "false");
        }

        /*
            ==============_LOCAL STORAGE_============== 
            modify data in local storage (ticket task)
        */ 
        ticket_obj[ticketIdx].task = task_cont.innerText; // DB changes
        localStorage.setItem("JIRA_TICKET", JSON.stringify(ticket_obj)); // changes to Local Storage
    })

    
}

/*
    function to handle remove button
    => if remove btn mode is on, on clicking on any of the ticket will remove from the page
*/ 
function handleRemoveBtn(ticket_cont, id) {
    ticket_cont.addEventListener("click", (e) => {
        if (remove_flag) {
            let ticketIdx = getTicketIdx(id); // get ticket id from ticket_object array
            ticket_obj.splice(ticketIdx, 1); // DB removal => remove specified index from ticket_object array

            /* ==============_LOCAL STORAGE_============== */ 
            localStorage.setItem("JIRA_TICKET", JSON.stringify(ticket_obj)); // changes to Local Storage
            
            ticket_cont.remove(); // UI removal
        }
    })

}

/*
    function to handle ticket color 
    => will changing ticket color for priority 
*/ 
function handleColor(ticket_cont, ticket_id) {
    let ticket_color = ticket_cont.querySelector(".ticket-color");
    let ticketIdx = getTicketIdx(ticket_id);

    ticket_color.addEventListener("click", (e) => {
        let currentTicketColor = ticket_color.classList[1];
        let currentTicketColorIdx = colors.findIndex((color) => {
            return color == currentTicketColor;
        });
        currentTicketColorIdx = (currentTicketColorIdx + 1) % colors.length;
        let newTicketColor = colors[currentTicketColorIdx];

        ticket_color.classList.remove(currentTicketColor);
        ticket_color.classList.add(newTicketColor);

        // also change old color to new color of ticket in ticket object array
        ticket_obj[ticketIdx].ticket_color = newTicketColor;

        /* ==============_LOCAL STORAGE_============== */
        localStorage.setItem("JIRA_TICKET", JSON.stringify(ticket_obj));
    })
}

/* 
    function to get default state of modal
    => on press shift
    i) white out written task
    ii) bring to default color
*/
function modalDefaultState() {
    text_area.value = "";
    
    priority_color.forEach((eachColorElem) => {
        eachColorElem.classList.remove("border");
        if(eachColorElem.classList[0] == "black") {
            eachColorElem.classList.add("border");
        }
    })
    modal_priority_color = colors[colors.length - 1]; // make black to default
}

/*
    function to get ticket index from ticket array object
*/ 
function getTicketIdx(id) {
    let idx = 0;
    for(let i = 0; i < ticket_obj.length; i++) {
        if(ticket_obj[i].ticket_id == id) {
            idx = i;
            break;
        }
    }

    return idx;
}
