var inputs = document.querySelectorAll('input[type=number]');

for (input of inputs) {
    input.value = getCookie(input.name);

    input.addEventListener('input', function (event) {
        setCookie(event.target.name, event.target.value);
    }, false);
}

function getCookie(name) {
    var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return v ? v[2] : null;
}

function setCookie(name, value, days = 999) {
    var d = new Date;
    d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * days);
    document.cookie = name + "=" + value + ";path=/;expires=" + d.toGMTString();
}

var inputs = document.getElementsByTagName("input");
for (input of inputs)
    input.addEventListener("keyup", function (event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
            event.preventDefault();
            // Trigger the button element with a click
            document.getElementById("submit").click();
        }
    });

const a1 = RoughNotation.annotate(document.querySelector('#pastLoss'), { type: 'circle', color: 'red', animationDuration: 1000 });
const a2 = RoughNotation.annotate(document.querySelector('#future'), { type: 'highlight', color: 'yellow', iterations: 1, multiline: true, rtl: true, animationDuration: 1500 });

const ag = RoughNotation.annotationGroup([a1, a2]);

function onSubmit() {
    let form = document.getElementById('form');
    let calc = document.getElementById('calculations');

    if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();

        form.classList.add('was-validated');

        return;
    }
    form.classList.remove('was-validated');

    const age = parseInt(form.current_age.value);
    const salary = parseInt(form.salary.value);
    const startedWorkingAge = parseInt(form.start_of_work_age.value);

    let frayer = calculateFrayer(age, salary, startedWorkingAge)

    document.getElementById('pastLoss').innerText = numberWithCommas(frayer.pastLoss);
    document.getElementById('futureGains').innerText = numberWithCommas(frayer.futureGains);

    calc.style.display = 'block';
    form.style.display = 'none';
    
    if (window.innerWidth < 480)
        calc.scrollIntoView(true);
    ag.hide();
    ag.show();
}

function numberWithCommas(x) {
    return parseInt(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function calculateFrayer(age, salary, startedWorkingAge) {
    const averageDepositFee = 2.12 / 100;
    const averageAccFee = 0.21 / 100;

    const goodDepositFee = 1.49 / 100;
    const goodAccFee = 0.1 / 100;

    const retirementAge = 65
    const normalYield = 6.85 / 100;

    const yearsWorked = age - startedWorkingAge;
    const yearsLeft = retirementAge - age

    const badPastPension = calculatePension(salary, yearsWorked, normalYield, averageDepositFee, averageAccFee, 0);
    const goodPastPension = calculatePension(salary, yearsWorked, normalYield, goodDepositFee, goodAccFee, 0);

    const currentPensionSize = badPastPension.pensionSize;
    const pastLoss = goodPastPension.pensionSize - currentPensionSize;

    const badFuturePension = calculatePension(salary, yearsLeft, normalYield, averageDepositFee, averageAccFee, currentPensionSize)
    const goodFuturePension = calculatePension(salary, yearsLeft, normalYield, goodDepositFee, goodAccFee, currentPensionSize)

    const futureGains = goodFuturePension.pensionSize - badFuturePension.pensionSize;

    return {
        pastLoss,
        futureGains
    }
}

function getYearlyPensionDeposit(salary) {
    const employerCompensationDep = 8.33 / 100;
    const employerPensionDep = 6.5 / 100;
    const employeePensionDep = 6 / 100;
    const pensionDepositPercent = employerCompensationDep + employerPensionDep + employeePensionDep
    const yearlyPensionDeposit = salary * pensionDepositPercent * 12;
    return yearlyPensionDeposit
}

function calculatePension(salary, yearsNum, yield, depositFee, accFee, initialAmount) {
    let pensionSize = initialAmount || 0;
    let depositFeePaid = 0;
    let accFeePaid = 0;

    const yearlyPensionDeposit = getYearlyPensionDeposit(salary)
    const depositAfterFee = yearlyPensionDeposit * (1 - depositFee)
    for (let i = 0; i < yearsNum; i++) {
        const withNewDeposit = pensionSize + depositAfterFee;
        const withYields = withNewDeposit * (1 + yield);
        const afterAccFee = withNewDeposit * (1 + yield - accFee);

        depositFeePaid += yearlyPensionDeposit - depositAfterFee;
        accFeePaid += withYields - afterAccFee;
        pensionSize = afterAccFee;
    }
    return {
        pensionSize,
        depositFeePaid,
        accFeePaid
    }
}

function handleDrop(input) {
    var files = input.files, f = files[0];
    if (!f.name.endsWith('.xls')) {
        alert('בבקשה תעלו את הקובץ ״פרטי המוצרים שלי.xls״');
        return;
    }
    var reader = new FileReader();
    reader.onload = function (e) {
        document.getElementById('upload').style.display = 'none'
        let data = new Uint8Array(e.target.result);
        let form = document.getElementById('form');
        let calc = document.getElementById('calculations');

        pensionFunds = extractPensionFunds(data);

        const age = parseInt(form.current_age.value);
        const salary = parseInt(form.salary.value);
        const startedWorkingAge = parseInt(form.start_of_work_age.value);

        let frayer = calculateFrayerWithMasleka(age, salary, startedWorkingAge, pensionFunds)

        document.getElementById('pastLoss').innerText = numberWithCommas(frayer.pastLoss);
        document.getElementById('futureGains').innerText = numberWithCommas(frayer.futureGains);

        calc.style.display = 'block';
        calc.scrollIntoView(true);
        ag.hide();
        ag.show();
    };
    reader.readAsArrayBuffer(f);
}

function calculateFrayerWithMasleka(age, salary, startedWorkingAge, pensionFunds) {
    console.log(pensionFunds);

    return {
        pastLoss: 12345,
        futureGains: 123456
    }
}

function extractPensionFunds(data) {
    var data = new Uint8Array(data);
    var workbook = XLSX.read(data, { type: 'array' });

    return sheetToJson(workbook.Sheets["קרנות פנסיה חדשות"]).map(x => ({
        pensionSize: x["סה\"כ חיסכון"],
        depositFee: x["דמי ניהול – הפקדות"],
        accFee: x["דמי ניהול - חיסכון"],
    }));
}

if (document.querySelector('.file-upload'))
    $('.file-upload').file_upload({
        messages: {
            default: "תגרור לכאן את קובץ האקסל שהורדתם מהמסלקה או תלחצו"
        },
        allowedFileExtensions: ["xls"],
        onFileUpload: handleDrop
    });

function readColumnWiseData(range, ws) {
    var columnWiseData = [];
    for (var C = range.s.c; C <= range.e.c; ++C) {
        columnWiseData[C] = [];
        for (var R = range.s.r; R <= range.e.r; ++R) {

            var cellref = XLSX.utils.encode_cell({ c: C, r: R });
            if (!ws[cellref]) continue;
            var cell = ws[cellref];
            columnWiseData[C].push(cell.v);

        };
    }
    return columnWiseData;
}

function convertCSVToJSON(rows) {
    const titles = rows[0];

    return rows.slice(1).map(row => {
        const values = row;
        return titles.reduce((object, curr, i) => (object[curr] = values[i], object), {})
    });
};

function sheetToJson(sheet, skipRows = 2) {
    return convertCSVToJSON(readColumnWiseData(XLSX.utils.decode_range(`A${skipRows + 1}:${sheet['!ref'].split(':')[1]}`), sheet));
}