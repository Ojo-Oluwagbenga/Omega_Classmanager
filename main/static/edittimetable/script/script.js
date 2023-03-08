$(document).ready(function(){
    let t_table = {
        "Monday":[],
        "Tuesday":[],
        "Wednesday":[],
        "Thursday":[],
        "Friday":[],
        "Saturday":[],
        "Sunday":[],
    }
    function collect_Texts(){
        $(".collectible").each(function(){
            let item = $(this);
            const col = item.parent().attr("col");
            const row_index = item.parent().parent().attr("given_index");
            const tab = item.parent().parent().parent().parent().attr("tab");

            if (typeof(t_table[tab][row_index]) == "undefined"){
                t_table[tab][row_index] = {}
            }
            t_table[tab][row_index][col] = item.val()
        })
    }
    function collect_status(){
        let added_codes = [];
        $(".row .actions").each(function(){
            let item = $(this);

            const col = item.parent().attr("col");
            let itm_par = item.parent().parent();
            const row_index = itm_par.attr("given_index");
            const row_code = itm_par.attr("given_code");
            const tab = item.parent().parent().parent().parent().attr("tab");
            
            t_table[tab][row_index][col] = item.attr("status");
            t_table[tab][row_index]['daycl_code'] = row_code;
            t_table[tab][row_index]['day'] = tab;
            added_codes.push(row_code)
        })

        return added_codes;
    }

    
    $("#update").click(function(){
        t_table = {
            "Monday":[],
            "Tuesday":[],
            "Wednesday":[],
            "Thursday":[],
            "Friday":[],
            "Saturday":[],
            "Sunday":[],
        }

        collect_Texts();
        let all_codes = collect_status();

        // console.log(added_codes);
        // return

        // console.log(t_table);/
        error = 0;

        if (error == 0){    
            popAlert("Updating Timetable...")
            $(".editbox .row").css({
                "border-left":"none"
            })
            axios({
                method: 'POST',
                url: './api/class/update_timetable',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    "X-CSRFToken" : $("input[name='csrfmiddlewaretoken']").val()
                },
                data: {
                    payload: {
                        timetable_data:t_table,
                        rep_code:"rep_code",
                        class_code:"irK9v",
                        all_codes:all_codes,
                    }             
                }
            }).then(response => {
                response = response.data;
                console.log(response);
                if (response.passed){
                    popAlert("Timetable updated successfully")
                }else{
                    popAlert("Issue Encountered. Please resolve");
                    if (response.error){
                        let errorset = response.error;
                        
                        for (const key of Object.keys(errorset)) {
                            const pair = key.split("|");
                            const tab = pair[0];
                            const row = pair[1];
                            const col = pair[2];

                            console.log(tab, row, col);

                            

                            $(`.editbox[tab=${tab}] .row[given_index=${row}]`).css({
                                "border-left":"2px solid red"
                            })

                            $(`.editbox[tab=${tab}] .row[given_index=${row}] .editbox[col=${col}] input`).css({
                                "border-bottom":"2px solid #ff00005e"
                            }).click(function(){
                                $(this).css({
                                    "border-bottom":"none"
                                })
                            })
                            // break;
                            
                        }
                    }
                }

                // if (response.passed){
                //     popAlert("Channel created!, Redirecting...");
                //     setTimeout(() => {
                //         window.location.href = '/dashboard'
                //     }, 1200);
                // }else{
                //     popAlert("Unable to create channel. Check Entries");
                // }

            })
            .catch(error => console.error(error))
        }
        
    });
})