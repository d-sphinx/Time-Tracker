var tasks, dateStart, timer, timerOn = false;

// главный function-class, экземпляры этого класса хранят задачи
function Task(name, start, stop, cost) {
    this.name = name ? name : '(no description)';
    this.start = start ? start : null;
    this.stop = stop ? stop : null;
    this.cost = cost ? cost : 0;
}

// добавление новой задачи (завершенной)
function addTask(name, start, stop) {
    var t = new Task(name, start, stop, calcCost(start, stop));
    tasks.unshift(t);
    save();
}

// генерация списка - напишем на чистом Vanilla JS...
function showTasks() {
    var t_msec = 0;
    var t_cost = 0;

    var list = document.getElementById('list');
    while (list.firstChild) list.removeChild(list.firstChild);

    var head = document.createElement('div');
    head.setAttribute('class', 'col-md-12');

    var text1 = document.createElement('div');
    text1.setAttribute('class', 'header col-md-8');
    text1.appendChild(document.createTextNode('Задача'));
    head.appendChild(text1);

    var text2 = document.createElement('div');
    text2.setAttribute('class', 'header col-md-2');
    text2.appendChild(document.createTextNode('Время'));
    head.appendChild(text2);

    var text3 = document.createElement('div');
    text3.setAttribute('class', 'header col-md-2');
    text3.appendChild(document.createTextNode('Стоимость'));
    head.appendChild(text3);

    list.appendChild(head);

    tasks.forEach((item, id) => {
        t_msec += item.stop.getTime() - item.start.getTime();
        t_cost += item.cost;

        var row = document.createElement('div');
        row.setAttribute('class', 'col-md-12');

        var name = document.createElement('div');
        name.setAttribute('class', 'col-md-8');

        var span = document.createElement('span');
        span.setAttribute('class', 'display-name');
        span.innerHTML = item.name;
        name.appendChild(span);

        var input = document.createElement('input');
        input.setAttribute('type', 'text');
        input.setAttribute('class', 'edit-name');
        input.setAttribute('id', 'edit-' + id);
        input.style.display = 'none';
        name.appendChild(input);

        row.appendChild(name);

        var time = document.createElement('div');
        time.setAttribute('class', 'col-md-2');
        time.appendChild(document.createTextNode(formatDiff(item.start, item.stop)));
        row.appendChild(time);

        var cost = document.createElement('div');
        cost.setAttribute('class', 'col-md-2');
        cost.appendChild(document.createTextNode(item.cost.toFixed(2) + ' руб.'));
        row.appendChild(cost);

        list.appendChild(row);
    });

    if (tasks.length > 0) {
        var total = document.createElement('div');
        total.setAttribute('class', 'col-md-12');

        var total_text = document.createElement('div');
        total_text.setAttribute('class', 'total col-md-8');
        total_text.appendChild(document.createTextNode('Итого'));
        total.appendChild(total_text);

        var total_time = document.createElement('div');
        total_time.setAttribute('class', 'total col-md-2');
        total_time.appendChild(document.createTextNode(formatDiff(t_msec)));
        total.appendChild(total_time);

        var total_cost = document.createElement('div');
        total_cost.setAttribute('class', 'total col-md-2');
        total_cost.appendChild(document.createTextNode(t_cost.toFixed(2) + ' руб.'));
        total.appendChild(total_cost);

        list.appendChild(total);
    }

    assignEvents();
}

function save() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function load() {
    var nm, st, sp, ct;
    tasks = JSON.parse(localStorage.getItem('tasks'), (name, value)=> {
        if (name == 'name') nm = value;
        if (name == 'start') st = new Date(value);
        if (name == 'stop') sp = new Date(value);
        if (name == 'cost') ct = value;
        return typeof value == 'object' && name != '' ? new Task(nm, st, sp, ct) : value;
    });
    if (tasks == null) tasks = [];
}

// вывод затраченного времени в удобочитаемом виде
function formatDiff(start, stop) {
    var e_days;
    if (typeof stop == 'undefined')
        e_days = start / 86400000;
    else
        e_days = (stop.getTime() - start.getTime()) / 86400000;
    var days = Math.floor(e_days);
    var e_hrs = (e_days - days) * 24;
    var hrs = Math.floor(e_hrs);
    var e_mins = (e_hrs - hrs) * 60;
    var mins = Math.floor(e_mins);
    var secs = Math.round((e_mins - mins) * 60);
    if (hrs < 10) hrs = '0' + hrs;
    if (mins < 10) mins = '0' + mins;
    if (secs < 10) secs = '0' + secs;
    return (days ? days + ' дней ' : '') + hrs + ':' + mins + ':' + secs;
}

// вычисление стоимости
function calcCost(start, stop) {
    var rate = parseInt($('#rate').val());
    if (!rate) rate = 100;
    var rate_msec = rate / 3600000;
    var diff = stop.getTime() - start.getTime();
    return diff * rate_msec;
}

// присвоение событий элементам списка
function assignEvents() {
    $('.display-name').click(function () {
        $(this).hide();
        $(this).siblings('.edit-name').show().val($(this).text()).focus();
    });
    $('.edit-name').focusout(function () {
        $(this).hide();
        var val = $(this).val();
        if (val.length < 1) val = '(no description)';
        $(this).siblings('.display-name').show().text(val);
        var id = parseInt(this.id.replace('edit-', ''));
        tasks[id].name = val;
        save();
    });
}

$('#btn_start').on('click', ()=> {
    if (timerOn) {
        clearInterval(timer);
        addTask($('#new_task').val(), dateStart, new Date());
        showTasks();
        $('#counter').empty();
        $('#btn_start').attr('value', 'Go!');
    }
    else {
        dateStart = new Date();
        timer = setInterval(()=> {
            $('#counter').html(formatDiff(dateStart, new Date()));
        }, 100);
        $('#btn_start').attr('value', 'Stop');
    }
    timerOn = !timerOn;
});

// инициализация ("and here we go!..")
load();
showTasks();