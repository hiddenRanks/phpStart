class App {
    //생성자 (메소드 생성) / let app = new App(받을 값);
    constructor() {
        this.fundList = [];
        this.fundCnt = 1; //현재 펀드번호

        //private list nav = document.querySelectorAll
        this.nav = document.querySelectorAll("nav > ul > li > a");

        this.nav.forEach(x => {
            x.addEventListener("click", this.changeMenu.bind(this)); //bind: 묶어주다.
        });

        //투자자 리스트
        this.invList = [];

        this.articleList = document.querySelectorAll("article");

        this.loadingMethod = {
            "list": this.loadingList.bind(this),
            "register": this.loadingRegister.bind(this),
            "investor": this.loadingInvestor.bind(this)
        }

        //투자자들을 담는 공간
        this.invContainer = document.querySelector(".inv-list");

        //펀드들을 담는 공간
        this.fundContainer = document.querySelector(".fund-list");

        document.querySelector("#register button").addEventListener("click", this.registerFund.bind(this));

        //디버깅용 펀드 데이터
        // this.fundList.push(new Fund("00001", "게임", "2019-05-10", 500000));
        // this.fundList.push(new Fund("00002", "게임", "2019-05-10", 50000));
        // this.fundList.push(new Fund("00003", "게임", "2019-05-10", 5000));
        // this.fundList.push(new Fund("00004", "게임", "2019-05-10", 500));
        // this.fundCnt += 4;

        this.popup = document.querySelector(".popup");
        document.querySelector("#btnClose").addEventListener("click", this.closePopup.bind(this));
        document.querySelector("#btnInvest").addEventListener("click", this.investFund.bind(this));

        this.signCanvas = document.querySelector("#sign");
        this.signCanvas.width = this.signCanvas.clientWidth;
        this.signCanvas.height = this.signCanvas.clientHeight;
        this.sCtx = this.signCanvas.getContext("2d");

        this.beforePoint = { x: 0, y: 0 };
        this.startDraw = false;
        //싸인창에 마우스 클릭할 경우 작동
        this.signCanvas.addEventListener("mousedown", (e) => {
            this.startDraw = true;
            this.beforePoint.x = e.offsetX;
            this.beforePoint.y = e.offsetY;
        });

        this.signCanvas.addEventListener("mouseup", (e) => {
            this.startDraw = false;
        });

        this.signCanvas.addEventListener("mousemove", (e) => {
            if (!this.startDraw) return;

            this.sCtx.beginPath();
            this.sCtx.moveTo(this.beforePoint.x, this.beforePoint.y);
            this.sCtx.lineTo(e.offsetX, e.offsetY);
            this.sCtx.stroke();

            this.beforePoint.x = e.offsetX;
            this.beforePoint.y = e.offsetY;
        });

        this.toastContainer = document.querySelector("#toastList");
        this.loadingFundList();
        this.loadingInvestorList();
    }

    loadingFundList() {
        let req = new XMLHttpRequest();
        req.open("GET", "/fundlist.php");
        this.fundList = [];

        req.onreadystatechange = () => {
            if(req.readyState === XMLHttpRequest.DONE) {
                if(req.status === 200) {
                    let json = JSON.parse(req.responseText);
                    json.data.forEach(x => {
                        let fund = new Fund(x.id, x.name, x.end_date, x.total, x.current);
                        this.fundList.push(fund);
                    });
                } else {
                    this.showMsg("전송중 오류 발생");
                }
                this.nav[0].click();//시작과 동시에 클릭됨
            }
        };
        req.send();
    }

    investFund() {
        let fundNo = document.querySelector("#investNo").value;
        let money = document.querySelector("#money").value * 1;

        if(money <= 0) {
            this.showMsg("금액을 올바르게 입력하세요.");
            return;
        }

        let signData = this.signCanvas.toDataURL();

        let req = new XMLHttpRequest();
        req.open("POST", "/add_fund.php");

        req.onreadystatechange = () => {
            if(req.readyState === XMLHttpRequest.DONE) {
                if(req.status === 200) {
                    let json = JSON.parse(req.responseText);
                    
                    this.showMsg(json.msg);
                    if(json.success) {
                        this.popup.querySelector("#btnClose").click();
                        this.loadingFundList(); //펀드 리스트 갱신
                        this.loadingInvestorList(); //투자자 리스트 갱신
                    }
                } else {
                    this.showMsg("전송 오류 발생");
                }
            }
        };

        let formData = new FormData();
        formData.append("id", fundNo);
        formData.append("money", money);
        formData.append("sign", signData);

        req.send(formData);
    }

    loadingInvestorList() {
        let req = new XMLHttpRequest();
        req.open("GET", "/investor_list.php");
        this.invList = [];

        req.onreadystatechange = () => {
            if(req.readyState === XMLHttpRequest.DONE) {
                if(req.status === 200) {
                    let json = JSON.parse(req.responseText);
                    
                    json.data.forEach(x => {
                        let inv = new Investor({number:x.fid, name:x.fname}, x.uname, x.money, x.sign);
                        this.invList.push(inv);
                    });
                }
            }
        }

        req.send();
    }

    openPopup(fund) {
        if(user == null) {
            this.showMsg("로그인 후 투자하실수 있습니다.");
            return;
        }
        this.popup.querySelector("#investNo").value = fund.number;
        this.popup.querySelector("#investName").value = fund.name;
        this.popup.querySelector("#name").value = user.name;
        this.popup.querySelector("#money").value = 0;
        this.sCtx.clearRect(0, 0, this.signCanvas.width, this.signCanvas.height);
        this.popup.classList.add("active");
    }

    closePopup() {
        this.popup.classList.remove("active");
    }

    changeMenu(e) {
        e.preventDefault(); //a태그의 기본적인 이벤트를 없에준다. / 자주 씀
        let target = e.target.dataset.target;

        //메뉴 클릭시 나오는 메인
        this.articleList.forEach(x => x.classList.remove("active"));
        document.querySelector("#" + target).classList.add("active");

        //메뉴바
        this.nav.forEach(x => x.classList.remove("active"));
        e.target.classList.add("active");

        this.loadingMethod[target]();

        //크기 변경
        let inner = document.querySelector(".inner-content");
        let h = document.querySelector("#" + target).clientHeight;
        inner.style.height = h + 'px';
    }

    //펀드 등록 페이지
    loadingRegister() {
        let no = "00000" + this.fundCnt;
        no = no.substring(no.length - 5);

        document.querySelector("#fundNo").value = no;
        document.querySelector("#fundName").value = "";
        document.querySelector("#endDate").value = "";
        document.querySelector("#total").value = "";
    }

    //펀드 등록하는 로직
    registerFund() {
        let no = document.querySelector("#fundNo").value;
        let name = document.querySelector("#fundName").value;
        let endDate = document.querySelector("#endDate").value;
        let total = document.querySelector("#total").value;

        if (name == "" || endDate == "" || total == "") {
            this.showMsg("값이 없거나 잘못된 형식 입니다.");
            return;
        }

        //에이젝스 요청을 만듬
        let req = new XMLHttpRequest();
        req.open("POST", "/invest_ok.php"); //POST형식으로 연결부분을 연다.
        req.onreadystatechange = () => {    //callback / 요청상태가 바뀌었을때
            //===은 타입까지 똑같은지 확인한다.
            if(req.readyState === XMLHttpRequest.DONE) { //다 끝낫을시
                if(req.status === 200) { //200일 경우(성공)
                    let json = JSON.parse(req.responseText); //json으로 파스해줌
                    this.showMsg(json.msg);
                    
                    if(json.success) {
                        let recvData = json.data;
                        let fund = new Fund(recvData.id, name, endDate, total);
                        this.fundList.push(fund);
                        this.showMsg("등록 되었습니다.");
                        this.fundCnt++;
                        this.nav[0].click(); //등록후 이동됨
                    }
                } else { //실패
                    console.log('문제 발생');
                }
            }
        }

        let formData = new FormData();
        formData.append("name", name);
        formData.append("endDate", endDate);
        formData.append("money", total);

        req.send(formData);
    }

    //펀드 리스트 페이지
    loadingList() {
        this.fundContainer.innerHTML = "";
        this.fundList.forEach(x => {
            let div = x.getTemplate();
            this.fundContainer.appendChild(div);
            div.querySelector("button").addEventListener("click", () => {
                this.openPopup(x);
            });
            x.drawCircle();
        });
    }

    //투자자 보는 페이지
    loadingInvestor() {
        this.invContainer.innerHTML = "";
        this.invList.forEach(x => {
            this.invContainer.appendChild(x.getTemplate());
        });
    }

    showMsg(msg) {
        //alert(msg);
        let div = document.createElement("div");
        div.classList.add("toast");
        div.innerHTML = `<p class="msg">${msg}</p>
        <span class="close">&times;</span>`;

        let closed = false;

        let closeTimer = setTimeout(() => {
            if(closed) return;
            closed = true;
            div.style.opacity = 0;
            div.style.transform = 0.8;
            setTimeout(() => {
                this.toastContainer.removeChild(div);
            }, 600);
        }, 2500);

        div.querySelector(".close").addEventListener("click", () => {
            if(closed) return;
            closed = true;
            div.style.opacity = 0;
            div.style.transform = 0.8;
            setTimeout(() => {
                this.toastContainer.removeChild(div);
            }, 600);
        });

        this.toastContainer.appendChild(div);
    }
}

//html의 코드를 다 읽었을 때
window.onload = function () {
    //변경될 일이 없다면 let대신 const를 써준다.
    const app = new App();
}