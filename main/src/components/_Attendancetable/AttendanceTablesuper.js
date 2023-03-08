import React, {Component, useEffect, useReducer} from "react";
import Helper from "../../generals/requesthelper";
import Usertable from "./Usertable";
import Userrow from "./Userrow";

class AttendanceTablesuper extends Component {
    constructor(props) {
        super(props);

        this.state = {
            
        }
        this.table_data = {}

        //Filtered poll codes are those that show in the drop down
        this.filtered_poll_codes = {}
        this.all_poll_codes = {}

        // console.log(new Date("2023-03-05T04:00:00"))
        console.log(new Date("2023-03-01T21:00:00").getFullYear())

    }
    
    loadedpolls = {}
    attd_classes = [
        {
            name:"Mechanical Engnr",
            code:"MEE200",
        },
        {
            name:"Civil Engnr",
            code:"CVE200",
        },
        {
            name:"Electrical Engnr",
            code:"EEE209",
        }
    ]
    line_graph_data = {}
    bar_graph_data = {}
    tableset = []

 
    hasvalues(obj){
        return (Object.keys(obj).length > 0)
    }

    componentDidMount(){
        let data = {
            attendance_code: 'T1NE0',
            index_list:["marked_users_0"]
        }
        let context = this;
        console.log("test", this.faker(10, 2));
        new Helper().sendRequests('/api/attendance/fetch_tabledata', data, function(data){
            
            /*ATTD DB RESTRUCTURES -> The classes should be in JSON. as
                classes:{
                    MEE200:Mechanical, CVE:Civil Engine, and so on
                }
                create admins column 
                admins:['user_code1', 'usercode2', ...]

                EXTRAS:
                    ->Require the name on marking OF ATTD 
             */


            data = {
                passed:true,
                response:200,
                datapack:[
                    {
                        attendance_data:context.faker(200, 20),
                        creatorid:'loggeduser',
                        admins:['creator_code', 'loggeduser'],
                        classes:{
                            'MEE200':"Mechanical Engineering",
                            'CVE200':"Civil Engineering",
                            'CLI200':"Medicine and Incantation",
                        }
                    }
                ]
            }
            console.log(data);
            if (!data.passed){
                return
            }

            let datapack = data.datapack[0];
            let attds = datapack.attendance_data; // Returns all attendances that have been completed
            let owner = datapack.creatorid;
            let classes = datapack.classes;

            context.attd_classes = []
            for (const key in classes) {
                const element = classes[key];
                context.attd_classes.push({
                    name:element,
                    code:key,
                })
            }
            
            delete attds['mark_index']
            //Collect all created dates into filtered_poll_codes
            for (const key in attds){                
                let ind_attd_bio = attds[key]['poll_base_data']
                context.filtered_poll_codes[key] = {
                    created: new Date(ind_attd_bio['time_queued']).toDateString(),
                    created_raw:ind_attd_bio['time_queued'],
                    activated:new Date(ind_attd_bio['time_activated']).toDateString(),
                    activated_raw:ind_attd_bio['time_activated'],
                }
                context.table_data[key] = attds[key]
            }

            context.all_poll_codes = {...context.filtered_poll_codes}
            
            context.forceUpdate();
        })
    }

    faker(number_of_users, num_of_attd){
        let attendance_data={
           
        }
        let RandName = [
        "O’Furniture",
        "Olive",
        "Aida",
        "Maureen",
        "Teri Dactyl",
        "Peg",
        "Allie Grater",
        "Liz Erd",
        "A. Mused",
        "Noring",
        "Lois Di ",
        "Van Ryde",]
        
        let clas = ['MEE200', 'CVE200'];

        for (let i = 0; i < num_of_attd; i++) {
            let xk = Math.floor((Math.random() * 6) + 1);
            let date = (((i+1)%27) + "").padStart(2, 0);
            attendance_data['marked_users_' + i] = {
                poll_base_data:{
                    time_queued:"2023-03-05T02:08:28",
                    time_activated:"2023-03-"+date+"T04:00:00",
                    time_closed:"2023-03-05T05:00:00",
                    creator:"creator_code",
                },
                "creator_code":{
                    "user_code":'creator_code', 
                    "parent_opener":'base', 
                    "opened_count":0,
                },
            }
            
            for (let j = 0; j < number_of_users; j++) {
                let x = Math.floor((Math.random() * number_of_users) + 1);
                let jump = Math.floor((Math.random() * 3) + 1);

                let surn = x % RandName.length
                let nm = RandName.length - (x % RandName.length) - 1;
                let cl = x % clas.length;
                let tm = ((jump+x) % 50 + "").padStart(2, 0);

                attendance_data['marked_users_' + i]['user_'+j] = {
                    user_code:'user_'+j, 
                    name:RandName[surn] + " " + RandName[nm],
                    time_in:"2023-03-"+date+"T04:"+tm+":00",
                    class_code:clas[cl],
                    parent_opener:'creator_code', 
                    opened_count:0, 
                }                
                j += jump;
            }
        }

        return attendance_data;
    }

    normalizeArrangement(table){
        let norm = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        let ret = {}
        for (let i = 0; i < norm.length; i++){
            const d = norm[i];
            ret[d] = typeof(table[d]) == "undefined" ? [] : table[d]
        }
        return ret;
    }
    
    selectClick(ddId, dditem_id){
        
        // this.closeDropDown(ddId);    

        if (dditem_id == "all"){
            
            let allkeys = Object.keys(this.loadedpolls);
            console.log("Got here", allkeys.length);

            if (Object.keys(this.loadedpolls).length == 0){
                Object.keys(this.filtered_poll_codes).map((key, i) => {       
                    this.loadedpolls[key] = {
                        raw:this.filtered_poll_codes[key]['activated_raw'],
                        name:"Poll for " + this.filtered_poll_codes[key]['activated']
                    }
                });
            }else{
                this.loadedpolls = {}
            }
            this.forceUpdate()
            return;
        }
        
        const thistext = $("#" + dditem_id).text();

        if (this.loadedpolls[dditem_id]){
            this.unSelectClick(dditem_id);
            return;
        }
        this.loadedpolls[dditem_id] = {
            raw:$("#" + dditem_id).attr("bio")
        }
        this.loadedpolls[dditem_id].name = thistext;
        this.forceUpdate()
    }
    unSelectClick(key){
        delete this.loadedpolls[key];
        this.forceUpdate()
    }

    openSelect(ddId){
        
        let ostate = $("#" + ddId).attr("openstate");

        let ddobj = $("#"+ddId+" + .dropdownwrap .dropdown");
        if (ostate == 0){
            $("#"+ddId+" + .dropdownwrap").css("display", "flex");
            ddobj.css("height", "0px");
            $(`#${ddId} span.svghold`).css({'display':'flex'});
            setTimeout(function(){
                ddobj.css("height", '300px');
                $("#"+ddId).attr("openstate", 1);
            }, 150);
        }
        if (ostate == 1){
            this.closeDropDown(ddId);
        }
    }
    openByFilter(){
        let stext = $(`.filterer input`).val();
        
        var rgxp = new RegExp(stext, "gi");

        let nObj = {};
        Object.keys(this.all_poll_codes).map((k,i) =>{
            let txt = "Poll for " + this.all_poll_codes[k].activated
            if (txt.match(rgxp) !== null){
                nObj[k] = this.all_poll_codes[k];
            }
        })
        this.filtered_poll_codes = {...nObj}
        this.forceUpdate();
        
        if ((Object.keys(nObj)).length == 0){
            popAlert('No Match Found!');
        }else{
            $(`#classhold .ddhold`).click();
        }
    }    
    closeDropDown(id){        
        $("#"+id+" + .dropdownwrap .dropdown").css("height", "0px");
        $("#"+id+' span.svghold').css({'display':'none'});
        setTimeout(function(){
            $("#"+id+" + .dropdownwrap").css("display", "none");
            $("#"+id).attr("openstate", 0);
        }, 300);
    }
   
    

    selected_class = []
    buildClass(array){
        return (array.join(' ') + " table-item")
    }
    readTime(type, time){
        let md = new Date();
        if (time){
            md = new Date(time);
        }
        let month_names =  ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        let month_names_short = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        if (type == "time-short"){
            return md.getHours() + ":" + md.getMinutes();
        }
        if (type == "date-mdy"){
            // date month day year
            return md.toDateString();
        }
        if (type == "date-mdy-short"){
            const month = month_names_short[md.getMonth()];
            const day = (md.getDate() + "").padStart(2, 0);
            const year = md.getFullYear();

            return (month + " " + day + ", " + year);

            
        }
    }
    initChart(){
        console.log(this.selected_class);
        // let xValues = ["Jan 25","July 23 2029","October 5 103","34 September 1456",90,100,110,120,130,140,150];
        // let yValues = [7,8,8,9,9,9,10,11,14,14,15];
        let all_name = '';
        // let classes_keys = Object.keys(this.loadedpolls);

        this.attd_classes.map(data =>{
            if (this.selected_class.includes(data.code)){
                all_name =  all_name.length == 0 ? all_name + data.name : all_name + ", " + data.name
            }
        })

        // for (let i = 0; i < classes_keys.length; i++) {
        //     const key = classes_keys[i];
        //     let poll_data = this.loadedpolls[key];
        //     all_name =  all_name.length == 0 ? all_name + poll_data.name : all_name + ", " + poll_data.name

        // }
        this.all_name = all_name;
        all_name += " students"
        
        
        let xValues = []
        let yValues = []
        if (this.line_graph_data['dates']){
            xValues = [...this.line_graph_data['dates']]
            yValues = [...this.line_graph_data['counts']]
        }
        if (this.superLineChart){
            this.superLineChart.destroy()
        }

        let nonZeroInd = yValues.findIndex(val => val != 0);
        
        let fv = yValues[nonZeroInd]
        this.line_graph_data.firstNonZeroCount = nonZeroInd >= 0 ? (fv > 1 ? (fv + " Students") : fv + " Student") : null;
        this.line_graph_data.firstNonZeroDate = xValues[nonZeroInd];

        // xValues = ["2023-03-05T04:00:00", "2023-03-04T04:00:00"];
        // yValues = [2,3];

        this.superLineChart = new Chart("line-chart", {
            type: "line",
            data: {
                labels: xValues,
                datasets: [{
                fill: false,
                lineTension: 0,
                backgroundColor: "rgba(0,0,255,1.0)",
                borderColor: "rgba(0,0,255,0.1)",
                data: yValues
                }]
            },
            options: {
                legend: {display: false},
                title: {
                    display: true,
                    text: "Dates vs Gross Attendance for " + all_name
                }
                // scales: {
                //     yAxes: [{ticks: {min: 0, max:10}}],
                // }
            }
        });


        // let b_xValues = ["100% - 80%", "80% - 60%", "60% - 40%", "40% - 20%", "20% - 0%"];
        // let b_yValues = [55, 49, 44, 24, 115];

        let b_xValues = []
        let b_yValues = []

        if (this.bar_graph_data['ranges']){
            b_xValues = [...this.bar_graph_data['ranges']]
            b_yValues = [...this.bar_graph_data['counts']]
        }

        nonZeroInd = b_yValues.findIndex(val => val != 0);
        
        fv = b_yValues[nonZeroInd]
        this.bar_graph_data.firstNonZeroCount = nonZeroInd >= 0 ? (fv > 1 ? (fv + " Students") : fv + " Student") : null;
        this.bar_graph_data.firstNonZeroRange = b_xValues[nonZeroInd];

        console.log("WO------", this.bar_graph_data.firstNonZeroCount);
        

        var barColors = ["green", "blue","yellow","brown","red"];

        if (this.superBarChart){
            this.superBarChart.destroy()
        }
        
        this.superBarChart = new Chart("bar-chart", {
            type: "bar",
            data: {
                labels: b_xValues,
                datasets: [{
                    backgroundColor: barColors,
                    data: b_yValues
                }]
            },
            options: {
                legend: {display: false},
                title: {
                    display: true,
                    text: "Student count vs Attendance Range for " + all_name 
                }
            }
        });
        this.forceUpdate();
    }
    downloadData(qselect){
        $(qselect + " .chart-super-hold").css("width", 'max-content');
        
        $(qselect).css({"width": 'max-content', 'box-shadow':"unset"});
        let w = $(qselect).width();
        let h = $(qselect).height();


        html2canvas(document.querySelector(qselect), {
            width: w,
            height: h
            }).then(canvas => {
                $(qselect + " .chart-super-hold").css("width", '100%');
                $(qselect).css({"width": 'unset', 'box-shadow':"0px 0px 12px -2px grey"});
                var a = document.createElement('a');
                a.href = canvas.toDataURL("image/png");
                a.download = this.all_name + ' - data.png';
                a.click();
                document.body.appendChild(canvas)
        });
    }
    addToSelectedClass(code){
        let ini = this.selected_class.indexOf(code);
        this.selected_class.includes(code) ? this.selected_class.splice(ini, 1) : this.selected_class.push(code)
    }
    
    sortDate(datelist){
        // datelist = [
            //     {key:ss, value:12},
            //     {key:ss, value:12},
            //     {key:ss, value:12},
        // ]

        return datelist.sort((a, b) => new Date(a.value) - new Date(b.value));
        
    }

    readAndBuildData(){
        /*
            The above data is needed to build
                data for line graph like below
                    let xValues = ["Jan 25","July 23 2029","October 5 103","34 September 1456",90,100,110,120,130,140,150];
                    let yValues = [7,8,8,9,9,9,10,11,14,14,15];

                data for bar graph like below
                    let b_xValues = ["100% - 80%", "80% - 60%", "60% - 40%", "40% - 20%", "20% - 0%"];
                    let b_yValues = [55, 49, 44, 24, 115];

                data for raw data like below

                tableset = [
                        {
                            a__code:'is_head',
                            b__name:"Names",
                            c__level:"Level",
                            d__matric:"Matric",
                            z__perc_punctual:"% Punctuality",
                            zz__perc_attendance:"% Attendance",
                            f__date_1:{
                                signed:true,
                                time:"24th Jan 2021",
                            },
                            f__date_2:{
                                signed:true,
                                time:'25th August 2021',
                            },
                        },
                        {
                            a__code:'u_code',
                            b__name:"Ojo Oluwagbnega John",
                            c__level:200,
                            d__matric:"201/029",
                            z__perc_punctual:20,
                            zz__perc_attendance:72,
                            f__date_1:{
                                signed:true,
                                time:'4:03',
                            },
                            f__date_2:{
                                signed:true,
                                time:'4:03',
                            }
                        },
                    ]
        */
    
        let tableset = [
            {
                a__code:'is_head',
                b__name:"Names",
                c__level:"Level",
                d__matric:"Matric",
                z__perc_punctual:"Punctuality",
                zz__perc_attendance:"Attendance",
                
            },
        ]
        let sub_bar_graph_data = {
            "100% - 80%":0,
            "80% - 60%":0,
            "60% - 40%":0,
            "40% - 20%":0,
            "20% - 0%":0,
        }
        let sub_line_graph_data = []

        //Extract the loaded polls key in descending order of their activation date
        let loadedpolls = Object.keys(this.loadedpolls)
        if (loadedpolls.length == 0){
            popAlert("Kindly select the polls to tabulate")
            return
        }
        let toSort = []
        loadedpolls.forEach(ind_code => {
            toSort.push({
                key:ind_code,
                value:this.loadedpolls[ind_code]["raw"]
            })
        });
        loadedpolls = this.sortDate(toSort).map(pairObj=>pairObj.key) // old to earliest
        
        if (this.selected_class.length == 0){
            popAlert("Kindly select the classes to tabulate")
            return
        } 

        let all_passed_users = {}
        Object.keys(this.table_data).map((day_poll_key, i)=>{
            let day_poll = this.table_data[day_poll_key];
            if (!loadedpolls.includes(day_poll_key)){
                return
            }
            let create_data = day_poll["poll_base_data"];

            let newAttdChart = {
                date: create_data.time_activated,
                number_of_students:0
            }
            
            sub_line_graph_data.push(newAttdChart) 
            let sub_line_push_ind = sub_line_graph_data.length - 1;
            
            let creator_code = create_data.creator;
            Object.keys(day_poll).map((user_code, i)=>{
                if (user_code == "poll_base_data" || user_code == creator_code){
                    return
                }            
                let user = day_poll[user_code];    
                if (!this.selected_class.includes(user.class_code)){
                    return
                }

                if (!all_passed_users[user_code]){ //If its not inside before
                    all_passed_users[user_code] = {
                        number_marked:0,
                        sum_lateness:0,//The sum of the lateness to class
                        sum_class_length:0,//The sum total number of hours the classes the user marked-in was held
                        data:user,
                        indexer:user.name
                    }                  
 
                }
                sub_line_graph_data[sub_line_push_ind]["number_of_students"] +=1; //Increment the poll_count added above

                all_passed_users[user_code][day_poll_key] = {
                    time_in:user.time_in
                }

                let time_in = new Date(user.time_in);
                let time_on = new Date(create_data.time_activated);
                let time_of = new Date(create_data.time_closed);

                let lateness = time_in - time_on;
                let t_delta = time_of - time_on;

                all_passed_users[user_code]['number_marked'] += 1;
                all_passed_users[user_code]['sum_lateness'] += lateness;
                all_passed_users[user_code]['sum_class_length'] += t_delta;

            })            
        })
        
        //Extract all the sorting value and sort them
        let index_set = []
        Object.keys(all_passed_users).map((user_code, i)=>{
            let key = all_passed_users[user_code]["indexer"];
            index_set.push({
                key:user_code, 
                value:key
            })
        })
        index_set.sort((a, b) => {
            const nameA = a.value.toUpperCase(); // ignore upper and lowercase
            const nameB = b.value.toUpperCase(); // ignore upper and lowercase
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }            
            // names must be equal
            return 0;
        });
        
        
        //Enter the values into tableset an accordingly
        for (let j = 0; j < loadedpolls.length; j++) {
            const datekey = loadedpolls[j];
            let ins_key = (j + 1) + ""
            ins_key = "f__date_" + ins_key.padStart(10, "0");

            tableset[0][ins_key] = {
                signed: false,
                time: this.readTime("date-mdy", this.table_data[datekey]['poll_base_data']['time_activated']),
            }
        }
        for (let i = 0; i < index_set.length; i++) {
            const indexed_pair = index_set[i];
            let user_code = indexed_pair.key;
            let user = all_passed_users[user_code];
            console.log(user);

            let punctuality = Math.floor(100 * (1- user.sum_lateness/user.sum_class_length));
            let percentage_attd = Math.floor(100 * (user.number_marked/loadedpolls.length));

            let data = {
                a__code:user_code,
                b__name:user.data.name,
                c__level:"user.level",
                d__matric:"user.matric",
                z__perc_punctual:punctuality + "%",
                zz__perc_attendance:percentage_attd + "%",
                
            }
            for (let j = 0; j < loadedpolls.length; j++) {
                const datekey = loadedpolls[j];
                let ins_key = (j + 1) + ""
                ins_key = "f__date_" + ins_key.padStart(10, "0");

                data[ins_key] = {
                    signed: user[datekey] ? true : false,
                    time: user[datekey] ? this.readTime("time-short", user[datekey]['time_in']) : "-",
                    for:datekey
                }
            }           


            tableset.push(data);
            
            let attendance_index = Math.floor(percentage_attd/20.5);
            let bargraph_keys = Object.keys(sub_bar_graph_data)
            
            let punc_key = bargraph_keys[(bargraph_keys.length - 1) - attendance_index] //To Reverse
            sub_bar_graph_data[punc_key] += 1;
                        
        }

        let bar_graph_data = {
            ranges:[],
            counts:[]
        }
        let line_graph_data = {
            dates:[],
            counts:[]
        }
        //Read the values to their displayable format
        let bdg_keys = Object.keys(sub_bar_graph_data);
        for (let i = 0; i < bdg_keys.length; i++) {
            const range = bdg_keys[i];
            bar_graph_data.ranges.push(range);
            bar_graph_data.counts.push(sub_bar_graph_data[range]);            
        }

        sub_line_graph_data.sort((a, b) => new Date(b.date) - new Date(a.date));
        line_graph_data.dates = sub_line_graph_data.map((date_count) => this.readTime("date-mdy-short", date_count.date))
        line_graph_data.counts = sub_line_graph_data.map((date_count) => date_count.number_of_students)

        this.line_graph_data = {...line_graph_data}
        this.bar_graph_data = {...bar_graph_data}
        this.tableset = [...tableset];

        let context = this;
        this.forceUpdate();
        setTimeout(() => {
            this.initChart()
        }, 500);
        
        
        console.log(this.line_graph_data, this.bar_graph_data, this.tableset);

    }

    render() {
        return (
            <>
                <div>
                    <div id="classhold" className="providerSelectBox itembox">
                        <div className="nameBar normalwidth">
                            Select Polls to tabulate
                        </div>
                        <div className="normalwidth filterer" style={{"padding":"10px", display:"flex", justifyContent: "space-evenly", border: "2px solid #d7d7d7", borderBottom: "none", borderRadius: "10px 10px 0px 0px"}}>
                            <input style={{padding:"5px",width:"70%", outline:"none", border:"none", "backgroundColor": "whitesmoke"}} placeholder="Enter any consecutive class letters here" type="text"></input>
                            <span onClick={this.openByFilter.bind(this)} className="c-vert">Filter</span>
                        </div>
                        <div className="normalwidth ddhold" id="created_class" openstate="0" style={{"borderTop": "2px dashed #d7d7d7", borderRadius: "0 0 10px 10px"}}
                                        onClick={this.openSelect.bind(this, "created_class")}>

                            <span className="name">Click to select polls</span>
                            <span style={{"display":"none"}} className="svghold c-vert">
                                <svg style={{"height":"14px", fill:"whitesmoke" }}xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M201.4 137.4c12.5-12.5 32.8-12.5 45.3 0l160 160c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L224 205.3 86.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l160-160z"/></svg>
                            </span>
                        </div>

            
                        <div className="normalwidth dropdownwrap" >
                            <div className="dropdown">
                                <div id="dditem_all" className={"dditem"} onClick={this.selectClick.bind(this, "created_class", "all")}>{Object.keys(this.loadedpolls).length == 0 ? "Select ALL" : "Unselect All"}</div>
                                {
                                    Object.keys(this.filtered_poll_codes).map((key, i) => {                     
                                        return <div key={key} id={key} className={this.loadedpolls.hasOwnProperty(key)?"dditem selected":"dditem"} bio={this.filtered_poll_codes[key]['activated_raw']} onClick={this.selectClick.bind(this, "created_class", key)}>Poll for <span>{this.filtered_poll_codes[key]['activated']}</span></div>
                                    })
                                }
                                
                            </div>
                        </div>        
                    </div>
                    <div className="normalwidth selecteditems-hold">
                        {
                            Object.keys(this.loadedpolls).map((key, i) => {
                                let poll_data = this.loadedpolls[key]
                                return <span key={key} className=" selecteditems">
                                    <span>{poll_data['name']}</span>                        
                                    <span onClick={this.unSelectClick.bind(this, key)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" style={{"fill":"#7c1010", height:"13px"}} viewBox="0 0 320 512"><path d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z"/></svg>
                                    </span>
                                </span>
                            })
                        }
                    </div>
                    
                    <div className="class-super">
                        <div className="normalwidth namesuper">
                            <label className="nameBar">Choose classes to tabulate</label>

                            {
                                this.attd_classes.map((data, i)=>{
                                    return <label key={i} className="pack-label" >
                                        <input className="c-vert" type="checkbox" name="activate" onClick={()=>{this.addToSelectedClass(data.code)}}></input>
                                        <div className="c-vert">{data.name}</div>
                                    </label> 
                                })
                            }
                            
                        </div>
                    </div>

                    
                </div>
                <div className="gentable-super">
                    <div className="gentable" onClick={()=>{this.readAndBuildData()}}>
                        <svg style={{"height":"13px" }}xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M201.4 137.4c12.5-12.5 32.8-12.5 45.3 0l160 160c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L224 205.3 86.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l160-160z"/></svg>
                        <span>Generate Table</span>
                    </div>
                </div>

                {
                    this.tableset.length > 1 ?
               
                    <div className="data-container">
                        <div className="data-super-hold" id="line-chart-hold">
                            <div className="containment chartBio">
                                <div className="head">Gross attendance vs Dates</div>
                                <div className="bio">The table below shows the total number of students (Vertical) that were marked present at at each day class(Horizontal).
                                    {
                                        this.line_graph_data.firstNonZeroCount ?
                                            <div className="table-specific" >In this case, {this.line_graph_data.firstNonZeroCount + " of "+this.all_name} attended the class on {this.line_graph_data.firstNonZeroDate}. And so on...</div> 
                                        :""
                                    }
                                </div>
                                <div className="download" data-html2canvas-ignore="true" onClick={()=>{this.downloadData('#line-chart-hold')}}>Download Image Data</div>
                            </div>
                            <div className="containment chart-super-hold">
                                <div className="data-chart">
                                    <canvas id="line-chart"></canvas>                            
                                </div>
                            </div>
                        </div>

                        <div className="data-super-hold" id="bar-chart-hold">
                            <div className="chartBio">
                                <div className="head">Students Count vs Percentage Attendance</div>
                                <div className="bio">The table below shows the number of students (Vertical) that were marked present at a percentage of the total class (Horizontal).
                                    {
                                        this.bar_graph_data.firstNonZeroCount ?
                                            <div className="table-specific" >In this case, {this.bar_graph_data.firstNonZeroCount + " of "+this.all_name} attended {this.bar_graph_data.firstNonZeroRange} of the class, and so on...</div> 
                                        :""
                                    }
                                </div>
                                <div className="download" data-html2canvas-ignore="true" onClick={()=>{this.downloadData('#bar-chart-hold')}}>Download Image Data</div>

                            </div>
                            <div className="chart-super-hold">
                                <div className="data-chart" style={{paddingLeft:"10px"}}>
                                    <canvas id="bar-chart"></canvas>                            
                                </div>
                            </div>
                        </div>

                        <div className="data-super-hold" id="table-chart-hold">
                            <div className="chartBio">
                                <div className="head">Raw Table</div>
                                <div className="bio">
                                    Attendance record sheet for {this.all_name} students
                                </div>
                                <div className="download" data-html2canvas-ignore="true" onClick={()=>{this.downloadData('#table-chart-hold')}}>Download Image Data</div>
                            </div>
                            <div className="chart-super-hold">
                                <div className="table-super" style={{"gridTemplateColumns": `repeat(${Object.keys(this.tableset[0]).length - 1}, auto)`}}>                        
                                    {
                                        this.tableset.map((row, i1) => {
                                            const u_code_key = row['a__code']
                                            let returns = []
                                            let rowkeys = Object.keys(row).sort();
                                            rowkeys.map((row_key, i2) => {
                                                const itemval = row[row_key];
                                                row_key != 'a__code'?
                                                returns.push([
                                                    typeof(itemval) != 'object'?
                                                        <div className={this.buildClass([u_code_key,row_key])} key={i1+"-"+i2}>
                                                            {itemval}
                                                        </div>
                                                    :
                                                        u_code_key == 'is_head'?
                                                            <div className={this.buildClass([u_code_key,row_key, 'datetime'])} key={i1+"-"+i2}>
                                                                <div className="dt-lv1"><div>{itemval.time}</div></div>
                                                            </div>
                                                        : 
                                                            <div className={this.buildClass([u_code_key,row_key])} key={i1+"-"+i2}>
                                                                {
                                                                    itemval.signed ? 
                                                                        <>
                                                                            <span>
                                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M470.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L192 338.7 425.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>
                                                                            </span>                                                
                                                                            <span className="time">{itemval.time}</span>
                                                                        </>
                                                                    :
                                                                        <span>
                                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z"/></svg>
                                                                        </span>  
                                                                }
                                                                
                                                            </div>                                            
                                                ]):null

                                            })
                                            return (returns)
                                            
                                        })
                                    }                         
                                    
                                </div>
                            </div>
                        </div>

                    </div>: ""
                }
                
                
            </>
        );
    }
}

    // Prop of table set is passed in like
    /*props.tableset = [
        {
            code:'is_head',
            name:"Names",
            level:"Level",
            matric:"Matric",
            date_1:{
                signed:true,
                time_taken:"24th August 2021",
            }
        }
        {
            code:'u_code',
            name:"Ojo",
            level:200,
            matric:201/029,
            date_1:{
                signed:true,
                time_taken:'4:03',
            }
        }
    ]*/

export default AttendanceTablesuper;


