let tennis_courts = [
    'S190502160848522070', // 인재개발원 테니스장(인조잔디 B면)
    'S190502151751379566', // 인재개발원 테니스장(인조잔디 A면)
    'S230112145124510167', // 신도림테니스장 2월 평일 B코트 주간접수(17시~19시 조명 1시간 사용)
    'S230113110414377169', // 신도림테니스장 2월 평일 C코트 주간접수(07~09시 조명 1시간 사용)
    'S230113111450546974', // 신도림테니스장 2월 평일 C코트 주간 접수(17시~19시 조명 1시간 사용) 
    'S230113105623864714', // 신도림테니스장 2월 평일 C코트 주간 접수(09시~17시) 

];

function getReservationData(svc_id) {
    return new Promise((resolve, reject) => {
        /*
        rsv_svc_id=S230112145124510167&sltYear=2023&sltMonth=02&sltDay=12&yyyymm=202302&yyyy=2023&mm=02&dd=12
        */
        const today = new Date();
        const year = today.getFullYear();
        const month = `0${today.getMonth() + 1}`.slice(-2);
        const day = `0${today.getDate()}`.slice(-2);
        const data = {
            rsv_svc_id: svc_id,
            sltYear: year,
            sltMonth: month,
            sltDay: day,
            yyyymm: `${year}${month}`,
            yyyy: year,
            mm: month,
            dd: day
        };
        const options = {
            method: "POST",
            body: new URLSearchParams(data)
        };
        fetch("https://yeyak.seoul.go.kr/web/reservation/selectListReservCalAjax.do", options)
            .then(response => {
                return response.json()
            })
            .then(data => {
                resolve(data);
            })
            .catch(error => {
                reject(error);
            })
    });
}

function getCourtData(svc_id_list) {
    return new Promise((resolve, reject) => {
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'X-Requested-With': 'XMLHttpRequest',
            'Origin': 'https://yeyak.seoul.go.kr',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            'Referer': 'https://yeyak.seoul.go.kr/web/reservation/selectReservView.do?rsv_svc_id=S230113110414377169&code=T100&dCode=T108&sch_order=1&sch_choose_list=&sch_type=&sch_text=&sch_recpt_begin_dt=&sch_recpt_end_dt=&sch_use_begin_dt=&sch_use_end_dt=&svc_prior=N&sch_reqst_value=',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
            'Connection': 'close'
        };

        const data = {
            recent_svc_id: svc_id_list.map(i => '^' + i).join(''),
            locale: 'ko',
            now_svc_id: 'S230113110414377169'
        };

        const options = {
            method: 'POST',
            headers: headers,
            body: new URLSearchParams(data)
        };

        fetch('https://yeyak.seoul.go.kr/web/reservation/selectListRecentSvcAjax.do', options)
            .then(response => {
                return response.json();
            })
            .then(data => {
                const list = data.resultList;
                for (let i = 0; i < list.length; i++) {
                    let item = list[i];
                    const svc_id = item.SVC_ID;
                    const svc_name = item.SVC_NM;
                    //console.log(`${svc_id} - ${svc_name}`);
                }
                console.log(data);
                resolve(data);
            })
            .catch(error => {
                console.log(error)
                reject(error);
            });
    });
}

/*

getCourtData(tennis_courts)
.then(data=>{console.log(`data ${data}`)})
.catch(err => {
    console.error(err);
});
*/
//getReservationData('S230112145124510167').then(data => console.log(data)).catch(err => console.error)

console.log("HI Tennis booking!");

/*
background-image: url(../img/ko/icon_date1.png);
*/

let searchResults = document.querySelectorAll(".img_board a");

function createTable(data) {
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    const zps_month = `0${today.getMonth() + 1}`.slice(-2); //zero padding string
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const lastDayOfMonth = new Date(year, month, daysInMonth).getDay();

    // Create the table
    let table = document.createElement("table");
    table.classList.add('booker', 'calendar');

    // Create the header row
    let headerRow = document.createElement("tr");
    let weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let weekday of weekdays) {
        let headerCell = document.createElement("th");
        headerCell.innerHTML = weekday;
        headerCell.classList.add(weekday, 'booker', 'calendar', 'header');
        headerRow.appendChild(headerCell);
    }
    table.appendChild(headerRow);

    const resultListTm = data.resultListTm;
    const resultListDays = data.resultListDays;
    // Create the body rows
    let day = 1;
    let dayOfWeek = firstDayOfMonth;
    let started = false;
    while (day <= daysInMonth) {
        let row = document.createElement("tr");
        for (let i = 0; i < 7; i++) {
            let cell = document.createElement("td");
            if (started == false && dayOfWeek !== i || day > daysInMonth) {
                row.appendChild(cell);
                continue;
            }
            const zps_day = `0${day}`.slice(-2); //zero padding string
            const dateId = `${year}${zps_month}${zps_day}`;
            console.log(dateId);
            const rs_day = resultListDays.filter(map => map.YMD === dateId).pop();
            const rs = resultListTm[dateId];
            if (rs_day && rs) {
                if (rs_day.SVC_RESVE_CODE == 'Y' && rs.RCEPT_POSBL_YN == '1' && rs.RESVE_POSBL_CNT > 0) {
                    cell.classList.add("ok");
                } else if((rs_day.SVC_RESVE_CODE == 'C' || rs_day.SVC_RESVE_CODE == 'N') && rs.RCEPT_POSBL_YN == '1'){
                    cell.classList.add("full");
                }
            } else {
                cell.classList.add("na"); //not care
            }
            cell.classList.add(weekdays[i], 'booker', 'calendar', 'date');
            cell.innerHTML = day;
            day++;
            dayOfWeek = 0;
            started = true;

            row.appendChild(cell);
        }
        table.appendChild(row);
        dayOfWeek++;
    }
    table.addEventListener('click', (e) => {
        console.log("Table is clicked!");
        e.stopPropagation();
        e.preventDefault();
    });
    return table;
}

function addCalendarUI(atag, data) {
    const ul = atag.querySelector('ul.ib_attr')
    const con_box = atag.querySelector('.con_box');
    const li = document.createElement("li");
    const b = document.createElement("b");
    b.className = "date2";
    b.textContent = "예약 가능 현황";
    li.appendChild(b);
    li.appendChild(document.createElement("br"));
    const div = document.createElement("div");
    div.classList.add('booker', 'calendar', 'month');
    div.textContent = `${new Date().getFullYear()}년 ${new Date().getMonth() + 1}월`;
    con_box.appendChild(div);
    con_box.appendChild(createTable(data));

    // Append the new DOM element to the document
    ul.appendChild(li);

}

//let atag = document.querySelector('.img_board a');
//addCalendarUI(atag, {"resultListTm":{"20230213":{"SVC_ID":"S230112145124510167","USE_DE":"20230213","RCEPT_POSBL_YN":"1","REG_TOTAL_CNT":0,"RCRIT_NMPR_CNT":1,"RESVE_POSBL_CNT":1,"REQST_MUMM_CNT":1},"20230214":{"SVC_ID":"S230112145124510167","USE_DE":"20230214","RCEPT_POSBL_YN":"1","REG_TOTAL_CNT":1,"RCRIT_NMPR_CNT":1,"RESVE_POSBL_CNT":0,"REQST_MUMM_CNT":1},"20230215":{"SVC_ID":"S230112145124510167","USE_DE":"20230215","RCEPT_POSBL_YN":"1","REG_TOTAL_CNT":1,"RCRIT_NMPR_CNT":1,"RESVE_POSBL_CNT":0,"REQST_MUMM_CNT":1},"20230216":{"SVC_ID":"S230112145124510167","USE_DE":"20230216","RCEPT_POSBL_YN":"1","REG_TOTAL_CNT":1,"RCRIT_NMPR_CNT":1,"RESVE_POSBL_CNT":0,"REQST_MUMM_CNT":1},"20230217":{"SVC_ID":"S230112145124510167","USE_DE":"20230217","RCEPT_POSBL_YN":"1","REG_TOTAL_CNT":0,"RCRIT_NMPR_CNT":1,"RESVE_POSBL_CNT":1,"REQST_MUMM_CNT":1},"20230220":{"SVC_ID":"S230112145124510167","USE_DE":"20230220","RCEPT_POSBL_YN":"1","REG_TOTAL_CNT":0,"RCRIT_NMPR_CNT":1,"RESVE_POSBL_CNT":1,"REQST_MUMM_CNT":1},"20230221":{"SVC_ID":"S230112145124510167","USE_DE":"20230221","RCEPT_POSBL_YN":"1","REG_TOTAL_CNT":0,"RCRIT_NMPR_CNT":1,"RESVE_POSBL_CNT":1,"REQST_MUMM_CNT":1},"20230222":{"SVC_ID":"S230112145124510167","USE_DE":"20230222","RCEPT_POSBL_YN":"1","REG_TOTAL_CNT":0,"RCRIT_NMPR_CNT":1,"RESVE_POSBL_CNT":1,"REQST_MUMM_CNT":1},"20230223":{"SVC_ID":"S230112145124510167","USE_DE":"20230223","RCEPT_POSBL_YN":"1","REG_TOTAL_CNT":0,"RCRIT_NMPR_CNT":1,"RESVE_POSBL_CNT":1,"REQST_MUMM_CNT":1},"20230224":{"SVC_ID":"S230112145124510167","USE_DE":"20230224","RCEPT_POSBL_YN":"1","REG_TOTAL_CNT":1,"RCRIT_NMPR_CNT":1,"RESVE_POSBL_CNT":0,"REQST_MUMM_CNT":1},"20230227":{"SVC_ID":"S230112145124510167","USE_DE":"20230227","RCEPT_POSBL_YN":"1","REG_TOTAL_CNT":0,"RCRIT_NMPR_CNT":1,"RESVE_POSBL_CNT":1,"REQST_MUMM_CNT":1},"20230228":{"SVC_ID":"S230112145124510167","USE_DE":"20230228","RCEPT_POSBL_YN":"1","REG_TOTAL_CNT":1,"RCRIT_NMPR_CNT":1,"RESVE_POSBL_CNT":0,"REQST_MUMM_CNT":1}},"resultMap":{"VIEW_BEFORE_YN":"N","VIEW_NEXT_YN":"N"},"resultListDays":[{"YMD":"20230201","SVC_RESVE_CODE":"N"},{"YMD":"20230202","SVC_RESVE_CODE":"N"},{"YMD":"20230203","SVC_RESVE_CODE":"N"},{"YMD":"20230204","SVC_RESVE_CODE":"N"},{"YMD":"20230205","SVC_RESVE_CODE":"N"},{"YMD":"20230206","SVC_RESVE_CODE":"N"},{"YMD":"20230207","SVC_RESVE_CODE":"N"},{"YMD":"20230208","SVC_RESVE_CODE":"N"},{"YMD":"20230209","SVC_RESVE_CODE":"N"},{"YMD":"20230210","SVC_RESVE_CODE":"N"},{"YMD":"20230211","SVC_RESVE_CODE":"N"},{"YMD":"20230212","SVC_RESVE_CODE":"N"},{"YMD":"20230213","SVC_RESVE_CODE":"Y"},{"YMD":"20230214","SVC_RESVE_CODE":"C"},{"YMD":"20230215","SVC_RESVE_CODE":"C"},{"YMD":"20230216","SVC_RESVE_CODE":"C"},{"YMD":"20230217","SVC_RESVE_CODE":"Y"},{"YMD":"20230218","SVC_RESVE_CODE":"N"},{"YMD":"20230219","SVC_RESVE_CODE":"N"},{"YMD":"20230220","SVC_RESVE_CODE":"Y"},{"YMD":"20230221","SVC_RESVE_CODE":"Y"},{"YMD":"20230222","SVC_RESVE_CODE":"Y"},{"YMD":"20230223","SVC_RESVE_CODE":"Y"},{"YMD":"20230224","SVC_RESVE_CODE":"C"},{"YMD":"20230225","SVC_RESVE_CODE":"N"},{"YMD":"20230226","SVC_RESVE_CODE":"N"},{"YMD":"20230227","SVC_RESVE_CODE":"Y"},{"YMD":"20230228","SVC_RESVE_CODE":"C"}],"param":{"rsv_svc_id":"S230112145124510167","sltYear":"2023","sltMonth":"02","sltDay":"12","yyyymm":"202302","yyyy":"2023","mm":"02","dd":"12","codeUnitYn":"yyyymm","useDate":"202302","useDateDay":"20230212"},"resultStats":{"resultCode":"success","resultMsg":""}})

for (let i = 0; i < searchResults.length; i++) {
    const resultATag = searchResults[i];
    let onclick = resultATag.getAttribute('onclick') || '';
    const match = onclick.match(/fnDetailPage\('(.*?)'\);/);
    if (match.length === 0) {
        continue;
    }
    const svc_id = match[1];
    //console.log(svc_id);
    getReservationData(svc_id)
    .then(data => {
        addCalendarUI(resultATag, data);
    });
}

