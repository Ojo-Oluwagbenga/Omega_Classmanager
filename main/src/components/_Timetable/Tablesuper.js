import React, {Component} from "react";
import Daytable from "./Daytable";

class Tablesuper extends Component {
    constructor(props) {
        super(props);

        this.state = {
            table_data:{}
        }
    }  

    hasvalues(obj){
        return (Object.keys(obj).length > 0)
    }

    componentDidMount(){
        axios({
            method: 'POST',
            url: './api/class/fetchtable',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                "X-CSRFToken" : $("input[name='csrfmiddlewaretoken']").val()
            },
            data: {
                fetchpair:{
                    'class_code':"irK9v"
                }, 
            }
        }).then(response => {
            response = response.data;
            console.log(response);
            if (response.passed){
                if (this.hasvalues(response.queryset)){
                    let unarranged = response.queryset;
                    let data = this.normalizeArrangement(unarranged);
                    console.log('arranged',data);
                    this.setState({table_data: {...data}})
                }else{
                    console.log("-----");
                }
            }
            

        })
        .catch(error => console.error(error))
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
    // table_data = {
    //     Monday:[
    //         {name:"Applied Thermo", status:1},
    //         {name:"Applied Thermo", status:1},
    //     ],
    //     Tuesday:[
    //         {name:"Applied Thermo", status:1},
    //         {name:"Applied Thermo", status:1},
    //     ],
    // }

    render() {
        return (
            <>
                {
                    Object.keys(this.state.table_data).map((key, i) => {
                        return <Daytable day_set={this.state.table_data[key]} key={i} head={key}/>
                    })
                }
                
            </>
        );
    }
}



export default Tablesuper;


