const main = document.querySelector(".main");
const confirmMensage = document.querySelector(".confirm-mensage");
const pageTitle = document.getElementById("pageTitle");

function start(){
    if(CardForm.inputName.value.trim() == ""){
        CardForm.inputName.animate([
            {transform: "translateX(.5rem)", borderColor: "red"},
            {transform: "translateX(-.5rem)"},
            {transform: "translateX(0)", borderColor: "red"}
            
        ], 100);
        document.querySelector(".card-form").animate([
            {boxShadow: "1px 1px 10px red"}
        ], 100)
    }else{
        Loader.load();
        Storage.setState(1);
        Tasks.push(ObjectTask.create());
        Storage.setData(Tasks);
        setTimeout(() =>{
            DOM.initMenu(Tasks[Tasks.length - 1].name, Tasks[Tasks.length - 1].begin, Tasks[Tasks.length - 1].LastPause); 
            CardForm.close();
        }, 200);
    }
}

const Storage = {
    getState(){
        return localStorage.getItem("CheckPoint:state") || 0;
    },
    getData(){
        return JSON.parse(localStorage.getItem("CheckPoint:data")) || []
    },
    setData(data){
        localStorage.setItem("CheckPoint:data", JSON.stringify(data));
    },
    setState(state){
        localStorage.setItem("CheckPoint:state", state);
    }
}

const Tasks = Storage.getData();

const Modal = {
    open(){
        document.querySelector(".modal-overlay").classList.add("active");
    },
    close(){
        document.querySelector(".modal-overlay").classList.remove("active");
    },
    openPaused(){
        Tasks[Tasks.length - 1].LastPause = Utils.getAtualHours();

        document.querySelector(".task-content").classList.remove("active");

        document.querySelector(".modal-overlay.paused").classList.add("active");
        document.querySelector(".pausedInfo").innerHTML = `
            <h3 id="lastBeginPaused">Paused in ${Tasks[Tasks.length - 1].LastPause}</h3>
            <h3>Number of Paused: ${Tasks[Tasks.length - 1].hourPauses.length + 1}</h3>
        `;
    },
    closePaused(){
        document.querySelector(".task-content").classList.add("active");
        Tasks[Tasks.length - 1].hourPauses.push(ObjectTask.pausedObject(Tasks[Tasks.length - 1].LastPause, Utils.getAtualHours()));
        document.querySelector(".modal-overlay.paused").classList.remove("active");
        DOM.pause();
        App.reload();
    }
}

const Loader = {
    loader : document.querySelector(".loader"),
    load(){
        Loader.loader.classList.add("active");
        setTimeout(()=>{
            Loader.loader.classList.remove("active")
        }, 750)
    }
}

const CardForm = {
    inputName: document.getElementById("inputName"),
    show(){
        document.querySelector(".card-form").classList.add("active");
        CardForm.inputName.value ='';
    },
    close(){
        document.querySelector(".card-form").classList.remove("active");
    }
}

const RegistAside = {
    open(){
        document.querySelector(".regist-aside").classList.add("active");
    },
    close(){
        document.querySelector(".regist-aside").classList.remove("active");
    },
    innerInRegist(name, data, start, end, total){
        document.querySelector(".regist-content").innerHTML += `
        <div class="card-regist">
            <div class="card-regist-title">
                <h3>${name}</h3>
            </div>
            <div class="card-regist-content">
                <div class="card-regist-data">${data}</div>
                <div class="card-regist-hours">
                    <div id="startHour">Start in ${start}</div>
                    <div id="pausedHour">End in ${end}</div>
                </div>
            </div>
            <div class="card-regist-footer">
            <div>Total:</div>
            <div id="TotalTime">${total}</div>
            </div>
        </div>
        `;

    },
    clearRegist(){
        document.querySelector(".regist-content").innerHTML = ""; 
    }
}

const Utils = {
    formatHour(hour, min){
        if(hour < 10 && min < 10) return `0${hour} : 0${min}`
        if(hour >= 10 && min < 10) return `${hour} : 0${min}`
        if(hour < 10 && min >= 10) return `0${hour} : ${min}`
        return `${hour} : ${min}`
    },
    formatData(day, mon, year){
        let auxDay = day, auxMon = mon + 1, auxYear = `${year}`;
        if(day < 10) auxDay = "0" + day;
        if(auxMon < 10) auxMon = `0${auxMon}`;

        return `${auxDay}/${auxMon}/${auxYear.slice(2)}`
    },
    getAtualHours(){
        let date = new Date;
        let hour = date.getHours();
        let minutes = date.getMinutes();

        return this.formatHour(hour, minutes);
    },
    getAtualData(){
        let date = new Date;

        let day = date.getDate();
        let month = date.getMonth();
        let year = date.getFullYear();
        
        return this.formatData(day,month,year);
    },
    checkHourState(element){
        let date = new Date;
        let day = date.getDate();
        let hour = date.getHours();

        let taskDay = parseInt(element.data.slice(0,2));
        let taskHour = parseInt(element.begin.slice(0,2)); 

        if(taskDay < day && taskHour < hour || day - taskDay >= 2) return 0;
        return 1;
    },
    calcTotal(begin, end){
        let hourB = parseInt(begin.slice(0,2));
        let minB = parseInt(begin.slice(5,7));

        let hourE = parseInt(end.slice(0,2));
        let minE = parseInt(end.slice(5,7));

        let hourResult, minResult;

        hourResult = (hourB > hourE) ? hourE + 24 - hourB : hourE - hourB;
        if(minB > minE){
            hourResult--;
            minResult = (minE + 60) - minB;
        }else minResult = minE - minB;

        return this.formatHour(hourResult, minResult);
    }
}

const DOM = {
    initMenu(taskName, initHour, LastPause){
        pageTitle.innerText = `${taskName} • CheckPoint`;
        main.innerHTML = `
        <div class="task-content active">
            <div class="title-task">
                <h2>${taskName}</h2>
            </div>
            <div class="task-time-mural">
                <div class="task-time">
                    <div id="task-begin">${initHour}</div>
                    <h3>Begin</h3>
                </div>
                <div class="task-time">
                    <div id="task-pause">${LastPause}</div>
                    <h3>Pause</h3>
                </div>
                <div class="task-buttons">
                    <input type="button" value="Pause" onclick="Modal.openPaused()">
                    <input type="button" value="End" onclick="Modal.open()">
                </div>
            </div>
        </div>`
    },
    pause(){
        let taskPause = document.getElementById("task-pause");

        taskPause.innerText = Utils.getAtualHours();
    },
    end(){
        Modal.close();
        RegistAside.close();
        Tasks[Tasks.length - 1].end = Utils.getAtualHours();
        Storage.setData(Tasks);
        Storage.setState(0);

        main.innerHTML = `
            <input type="button" value="BEGIN" id="btnBegin" onclick="CardForm.show()"> 
        `
        Loader.load();

        setTimeout(()=>{
            confirmMensage.classList.add("active");
            pageTitle.innerText = `CheckPoint`;
        }, 200)
        
        setTimeout(()=>{
            confirmMensage.classList.remove("active");
        },2000)
        App.reload();
    }
}

const ObjectTask = {
    create(){
        return{
            name: CardForm.inputName.value,
            begin: Utils.getAtualHours(),
            LastPause: "  --  ",
            hourPauses: [],
            data: Utils.getAtualData(),
            end: "",
        }
    },
    pausedObject(begin, end){
        return {
            inicio: begin,
            fim: end
        }
    }
}

const App = {
    init(){ 
        let regist = Tasks.slice(0,Tasks.length);

        // Check if array is null
        if (Tasks.length == 0) return; 

        if(Storage.getState() == 1){
            if(Utils.checkHourState(Tasks[Tasks.length - 1])){
                DOM.initMenu(Tasks[Tasks.length - 1].name, Tasks[Tasks.length - 1].begin, Tasks[Tasks.length - 1].LastPause);
                regist.splice(regist.length - 1, 1);
            }else{
                Tasks.pop();
                regist = Tasks.slice(0,Tasks.length);
                Storage.setState(0);
            }
        }

        if (Tasks.length == 0) return; 

        regist.forEach((element)=>{
            RegistAside.innerInRegist(element.name,element.data,element.begin, element.end, Utils.calcTotal(element.begin, element.end))
        })

        Utils.calcTotal(Tasks[Tasks.length - 1].begin, Tasks[Tasks.length - 1].end)
        Storage.setData(Tasks);        
    },
    reload(){
        RegistAside.clearRegist();
        App.init();
    }
}

App.init();