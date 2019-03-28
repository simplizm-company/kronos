/*
 * kronos for jQuery
 * Version: 1.0.1
 * Author: shinyongjun
 * Website: http://www.simplizm.com/
 */

;(function ($) {
    'use strict';

    var Kronos = window.Kronos || {};

    Kronos = (function () {
        var fnidx = 0;

        function kronos(element, settings){
            var _ = this, settings = settings === undefined ? {} : settings;

            var defaults = {
                initDate: null,
                nameSpace: 'kronos',
                format: 'yyyy-mm-dd',
                visible: false,
                disableWeekends : false,
                button: {
                    month : true,
                    year : true,
                    trigger : false,
                    today : false
                },
                text: {
                    thisMonth : '월',
                    thisYear : '년',
                    days : ['일', '월', '화', '수', '목', '금', '토'],
                    month : ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
                    btnToday : '오늘로',
                    btnTrigger : '날짜 선택하기',
                    btnPrevMonth : '이전달',
                    btnNextMonth : '다음달',
                    btnPrevYear : '이전해',
                    btnNextYear : '다음해'
                },
                select: false,
                selectYear : {
                    start : -100,
                    end : 0
                },
                periodFrom: false,
                periodTo: false,
                date: {
                    /* ex : ['19910301', '1231'] */
                    disabled: [],
                    holiday: []
                },
                onChange: function () {
                    //console.log(date);
                }
            }

            _.opt = _.hasOwnProperty(defaults, settings);
            _.str = {}
            _.initial = {
                weekCount : 0,
                oldY : false,
                oldM : false
            };
            _.$input = $(element).attr('readonly', 'readonly').addClass(_.opt.nameSpace+'-input');
            _.$from = _.opt.periodFrom ? $(_.opt.periodFrom) : false;
            _.$to = _.opt.periodTo ? $(_.opt.periodTo) : false;

            _.core = {
                today : null,
                input : null,
                from : null,
                to : null
            }
            _.node = {
                outer: '<div class="'+_.opt.nameSpace+'-outer" />',
                trigger: '<button type="button" class="'+_.opt.nameSpace+'-trigger" title="'+_.opt.text.btnTrigger+'">'+_.opt.text.btnTrigger+'</button>',
                viewer: '<div class="'+_.opt.nameSpace+'-viewer" />',
                dateLayer: '<div class="'+_.opt.nameSpace+'-date-layer" />',
                monthLayer: '<div class="'+_.opt.nameSpace+'-month-layer" />',
                yearLayer: '<div class="'+_.opt.nameSpace+'-year-layer" />',
                btnPrevMonth: '<button type="button" class="'+_.opt.nameSpace+'-prev-month" title="'+_.opt.text.btnPrevMonth+'">'+_.opt.text.btnPrevMonth+'</button>',
                btnNextMonth: '<button type="button" class="'+_.opt.nameSpace+'-next-month" title="'+_.opt.text.btnNextMonth+'">'+_.opt.text.btnNextMonth+'</button>',
                btnPrevYear: '<button type="button" class="'+_.opt.nameSpace+'-prev-year" title="'+_.opt.text.btnPrevYear+'">'+_.opt.text.btnPrevYear+'</button>',
                btnNextYear: '<button type="button" class="'+_.opt.nameSpace+'-next-year" title="'+_.opt.text.btnNextYear+'">'+_.opt.text.btnNextYear+'</button>',
                btnToday: '<button type="button" class="'+_.opt.nameSpace+'-today" title="'+_.opt.text.btnToday+'">'+_.opt.text.btnToday+'</button>'
            }

            _.fnidx = fnidx++;
            _.keyupEvent = 'keyup.kronos'+_.fnidx,
            _.clickEvent = 'click.kronos'+_.fnidx;

            _.init(true);
        }

        return kronos;
    }());

    Kronos.prototype.hasOwnProperty = function(org, src) {
        var _ = this;

        for(var prop in src) {
            if (!Object.prototype.hasOwnProperty.call(src, prop)) {
                continue;
            }
            if ('object' === $.type(org[prop])) {
                org[prop] = ($.isArray(org[prop]) ? src[prop].slice(0) : _.hasOwnProperty(org[prop], src[prop]));
            } else {
                org[prop] = src[prop];
            }
        }

        return org;
    }

    Kronos.prototype.checkFormat = function () {
        var _ = this;

        _.initial.indexYS = _.opt.format.indexOf('y');
        _.initial.indexYE = _.opt.format.lastIndexOf('y')+1;
        _.initial.indexMS = _.opt.format.indexOf('m');
        _.initial.indexME = _.opt.format.lastIndexOf('m')+1;
        _.initial.indexDS = _.opt.format.indexOf('d');
        _.initial.indexDE = _.opt.format.lastIndexOf('d')+1;

        _.initial.formatY = String(_.opt.format.substring(_.initial.indexYS, _.initial.indexYE));
        _.initial.formatM = String(_.opt.format.substring(_.initial.indexMS, _.initial.indexME));
        _.initial.formatD = String(_.opt.format.substring(_.initial.indexDS, _.initial.indexDE));
    }

    Kronos.prototype.getTodayDate = function () {
        var _ = this;

        _.initial.date        = new Date();
        _.initial.todayY    = _.initial.date.getFullYear();
        _.initial.todayM    = _.initial.date.getMonth();
        _.initial.todayD    = _.initial.date.getDate();
        _.initial.dateLeng    = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        _.core.today    = String(_.initial.todayY) + _.combineZero(_.initial.todayM + 1) + _.combineZero(_.initial.todayD);
    }

    Kronos.prototype.combineZero = function(number) {
        return String(number).length == 1 ? '0' + String(number) : String(number);
    }

    Kronos.prototype.combineCore = function(year, month, date) {
        return String(year)+String(month)+String(date);
    }

    Kronos.prototype.isolateCore = function(core, get) {
        switch(get) {
            case 'year+month' :
                return core.substring(0, 6);
                break;
            case 'year' :
                return core.substring(0, 4);
                break;
            case 'month' :
                return core.substring(4, 6);
                break;
            case 'date' :
                return core.substring(6, 8);
                break;
            default :
                return false;
                break;
        }
    }

    Kronos.prototype.setLayout = function () {
        var _ = this;

        _.$outer = _.$input.wrap(_.node.outer).parent('.'+_.opt.nameSpace+'-outer');

        if (_.opt.button.trigger) {
            _.$trigger = _.$outer.append(_.node.trigger).children('.'+_.opt.nameSpace+'-trigger');
        }

        _.$viewer = _.$outer.append(_.node.viewer).children('.'+_.opt.nameSpace+'-viewer');
        _.$monthLayer = _.$viewer.append(_.node.monthLayer).children('.'+_.opt.nameSpace+'-month-layer');
        _.$monthLayerHead = _.$monthLayer.append('<div class="'+_.opt.nameSpace+'-month-head">').children('.'+_.opt.nameSpace+'-month-head');
        _.$monthLayerBody = _.$monthLayer.append('<div class="'+_.opt.nameSpace+'-month-body">').children('.'+_.opt.nameSpace+'-month-body');
        _.$yearLayer = _.$viewer.append(_.node.yearLayer).children('.'+_.opt.nameSpace+'-year-layer');
        _.$yearLayerHead = _.$yearLayer.append('<div class="'+_.opt.nameSpace+'-year-head">').children('.'+_.opt.nameSpace+'-year-head');
        _.$yearLayerBody = _.$yearLayer.append('<div class="'+_.opt.nameSpace+'-year-body">').children('.'+_.opt.nameSpace+'-year-body');
        _.$dateLayer = _.$viewer.append(_.node.dateLayer).children('.'+_.opt.nameSpace+'-date-layer');
    }

    Kronos.prototype.inputInit = function () {
        var _ = this;

        if (_.opt.initDate) {
            _.core.input = _.opt.initDate;
            _.$input.attr({'core' : _.core.input}).val(_.convertFormat(_.core.input));
        }
    }

    Kronos.prototype.convertFormat = function(core) {
        var _ = this, f, y, m, d;

        y = _.initial.formatY.length === 2 ? String(core.substring(2, 4)) : String(core.substring(0, 4));
        m = String(core.substring(4, 6));
        d = String(core.substring(6, 8));
        f = _.opt.format.replace(_.initial.formatY, y).replace(_.initial.formatM, m).replace(_.initial.formatD, d);

        return f;
    }

    Kronos.prototype.resetMnyLayer = function () {
        var _ = this;

        _.$monthLayer.removeClass('kronos-visible');
        _.$yearLayer.removeClass('kronos-visible');
    }

    Kronos.prototype.setDatepicker = function () {
        var _ = this;

        _.setDate();
        _.setMarkup();
        _.getCoreDate();
        _.setDateClass();
        _.onClickDate();
        _.onClickButton();
        _.onClickTitle();
        _.onChangeSelect();
        _.slideAnimate();
        _.resetMnyLayer();

        if (_.initFlag) {
            _.$input.focus();
        }
    }

    Kronos.prototype.setDate = function () {
        var _ = this;

        _.initial.thisY = _.initial.date.getFullYear();
        _.initial.thisM = _.initial.date.getMonth();
        _.str.thisM = _.combineZero(_.initial.thisM + 1);
        _.initial.prevY = _.initial.thisM === 0 ? _.initial.thisY - 1 : _.initial.thisY;
        _.initial.prevM = _.initial.thisM === 0 ? 11 : _.initial.thisM - 1;
        _.initial.nextY = _.initial.thisM === 11 ? _.initial.thisY + 1 : _.initial.thisY;
        _.initial.nextM = _.initial.thisM === 11 ? 0 : _.initial.thisM + 1;
        _.initial.dateLeng[1] = (_.initial.thisY % 4 === 0 && _.initial.thisY % 100 !== 0) || _.initial.thisY % 400 === 0 ? 29 : 28;
        _.initial.thisDateLeng = _.initial.dateLeng[_.initial.thisM];
        _.initial.titleYM = _.initial.thisY + '. ' + _.str.thisM;
        _.str.thisYM = _.initial.thisY + _.str.thisM;
        _.str.prevYM = _.initial.prevY + _.combineZero(_.initial.prevM + 1);
        _.str.nextYM = _.initial.nextY + _.combineZero(_.initial.nextM + 1);
        _.initial.date.setDate(1);
        _.initial.firstDay = _.initial.date.getDay();
    }

    Kronos.prototype.getCoreDate = function () {
        var _ = this;

        if (_.$input.attr('core')) {
            _.core.input = _.$input.attr('core');
        }

        if (_.$from && _.$from.attr('core')) {
            _.core.from = _.$from.attr('core');
        }

        if (_.$to && _.$to.attr('core')) {
            _.core.to = _.$to.attr('core');
        }
    }

    Kronos.prototype.resetPeriod = function () {
        var _ = this;

        _.$input.val(null).attr('core', null);
        _.core.input = null, _.core.from = null, _.core.to = null;

        _.setDateClass();
    }

    Kronos.prototype.slideAnimate = function () {
        var _ = this;

        _.$dateLayer.animate({'left' : _.initial.outerLeft}, 500, function () {
            _.$oldInner.remove();
            _.$dateLayer.css({'left' : 0});
            _.$newInner.removeClass('new').addClass('old').css({'left' : 0});
            _.initial.oldY = _.initial.thisY;
            _.initial.oldM = _.initial.thisM;
        });
    }
    
    Kronos.prototype.setMarkup = function () {
        var _ = this;

        _.setPositionLeft();
        _.setLayoutMarkup();
        _.setNaviMarkup();
        _.setDaysMarkup();
        _.setDateMarkup();
        _.setMonthMarkup();
        _.setYearMarkup();
    }

    Kronos.prototype.setPositionLeft = function () {
        var _ = this;

        switch(true) {
            case !_.initial.oldY || _.initial.oldY === _.initial.thisY && _.initial.oldM === _.initial.thisM :
                _.initial.innerLeft = '0px';
                _.initial.outerLeft = '0px';
                break;
            case _.initial.oldY < _.initial.thisY :
                _.initial.innerLeft = '100%';
                _.initial.outerLeft = '-100%';
                break;
            case _.initial.oldY > _.initial.thisY :
                _.initial.innerLeft = '-100%';
                _.initial.outerLeft = '100%';
                break;
            case _.initial.oldM < _.initial.thisM :
                _.initial.innerLeft = '100%';
                _.initial.outerLeft = '-100%';
                break;
            default :
                _.initial.innerLeft = '-100%';
                _.initial.outerLeft = '100%';
                break;
        }
    }

    Kronos.prototype.setLayoutMarkup = function () {
        var _ = this;

        console.log('setLayoutMarkup');

        _.$oldInner = _.$dateLayer.children('.'+_.opt.nameSpace+'-inner');
        _.$newInner = _.$dateLayer.append('<div class="'+_.opt.nameSpace+'-inner" style="left: '+_.initial.innerLeft+'" />').children('.'+_.opt.nameSpace+'-inner:last-child')
        _.$head = _.$newInner.append('<div class="'+_.opt.nameSpace+'-head" />').children('.'+_.opt.nameSpace+'-head');
        _.$body = _.$newInner.append('<div class="'+_.opt.nameSpace+'-body" />').children('.'+_.opt.nameSpace+'-body');
        _.$title = _.$head.append('<div class="'+_.opt.nameSpace+'-title" />').children('.'+_.opt.nameSpace+'-title');
    }

    Kronos.prototype.setNaviMarkup = function () {
        var _ = this;

        if (_.opt.select) {
            _.setSelectMarkup();
        } else {
            _.$titleYear = _.$title.append('<button class="'+_.opt.nameSpace+'-title-year">'+_.initial.thisY+_.opt.text.thisYear+'</button>').children('.'+_.opt.nameSpace+'-title-year');
            _.$titleMonth = _.$title.append('<button class="'+_.opt.nameSpace+'-title-month">'+_.opt.text.month[_.initial.thisM]+_.opt.text.thisMonth+'</button>').children('.'+_.opt.nameSpace+'-title-month');
        }

        if (_.opt.button.month) {
            _.$btnPrevMonth = _.$head.append(_.node.btnPrevMonth).children('.'+_.opt.nameSpace+'-prev-month');
            _.$btnNextMonth = _.$head.append(_.node.btnNextMonth).children('.'+_.opt.nameSpace+'-next-month');
        }

        if (_.opt.button.year) {
            _.$btnPrevYear = _.$head.append(_.node.btnPrevYear).children('.'+_.opt.nameSpace+'-prev-year');
            _.$btnNextYear = _.$head.append(_.node.btnNextYear).children('.'+_.opt.nameSpace+'-next-year');
        }

        if (_.opt.button.today) {
            _.$btnToday = _.$head.append(_.node.btnToday).children('.'+_.opt.nameSpace+'-today');
        }
    }

    Kronos.prototype.setSelectMarkup = function () {
        var _ = this;
        
        _.node.selectYear = '<select class="'+_.opt.nameSpace+'-select-year">';
        _.initial.selectYearStart = _.initial.todayY+_.opt.selectYear.start;
        _.initial.selectYearEnd = _.initial.todayY+_.opt.selectYear.end;
        for(var i = _.initial.selectYearEnd; i >= _.initial.selectYearStart; i--) {
            _.node.selectYear += i === _.initial.thisY ? '<option value="'+i+'" selected>'+i+'</option>' : '<option value="'+i+'">'+i+'</option>';
        }
        _.node.selectYear += '</select>'+_.opt.text.thisYear;
        _.$selectYear = _.$title.append(_.node.selectYear).children('.'+_.opt.nameSpace+'-select-year');
        _.$selectYearOption = _.$selectYear.children('option');

        _.node.selectMonth = '<select class="'+_.opt.nameSpace+'-select-month">';
        for(var i = 1; i < 13; i++) {
            _.node.selectMonth += i === (_.initial.thisM+1) ? '<option value="'+i+'" selected>'+i+'</option>' : '<option value="'+i+'">'+i+'</option>';
        }
        _.node.selectMonth += '</select>'+_.opt.text.thisMonth;
        _.$selectMonth = _.$title.append(_.node.selectMonth).children('.'+_.opt.nameSpace+'-select-month');
        _.$selectMonthOption = _.$selectMonth.children('option');
    }

    Kronos.prototype.setDaysMarkup = function () {
        var _ = this;

        _.node.markup = '<table><thead><tr>';
        for(var i = 0; i < 7; i++) {
            _.node.markup += '<th>'+_.opt.text.days[i]+'</th>';
        }
        _.node.markup += '</tr></thead>';
    }

    Kronos.prototype.setDateMarkup = function () {
        var _ = this, pmFirstDay = _.initial.dateLeng[_.initial.prevM] - _.initial.firstDay;

        _.node.markup += '<tbody><tr>';

        for (var i = 1; i <= _.initial.firstDay; i++) {
            _.node.markup += '<td><button type="button" core="'+_.str.prevYM+(pmFirstDay+i)+'" title="'+_.convertFormat(_.str.prevYM+(pmFirstDay+i))+'">'+(pmFirstDay+i)+'</button></td>';
            _.initial.weekCount++;
        }

        for(var i = 1; i <= _.initial.thisDateLeng; i++) {
            if (_.initial.weekCount === 0) {
                _.node.markup += '<tr>';
            }
            _.node.markup += '<td><button type="button" core="'+_.str.thisYM+_.combineZero(i)+'" title="'+_.convertFormat(_.str.thisYM+_.combineZero(i))+'">'+i+'</button></td>';
            _.initial.weekCount++;
            if (_.initial.weekCount === 7) {
                _.node.markup += '</tr>';
                _.initial.weekCount = 0;
            }
        }

        for (var i = 1; _.initial.weekCount != 0; i++) {
            if (_.initial.weekCount === 7) {
                _.node.markup += '</tr>';
                _.initial.weekCount = 0;
            } else {
                _.node.markup += '<td><button type="button" core="'+_.str.nextYM+_.combineZero(i)+'" title="'+_.convertFormat(_.str.nextYM+_.combineZero(i))+'">'+i+'</button></td>';
                _.initial.weekCount++;
            }
        }

        _.node.markup += '</tbody></table>';
        _.$body.html(_.node.markup);
        _.$viewer.css({'height' : _.$newInner.outerHeight()});
    }

    Kronos.prototype.setMonthMarkup = function () {
        var _ = this;

        _.$monthLayer.empty();
        for (var i = 1; i <= 12; i++) {
            _.$monthLayer.append('<button class="'+(_.initial.thisM == i-1 ? 'kronos-active' : '')+'">'+i+'</button>');
        }
        _.$btnMonth = _.$monthLayer.children('button');

        _.$btnMonth.on('click', function (e) {
            e.stopPropagation();
            _.initial.date.setMonth($(this).index());
            _.setDatepicker();
        });
    }

    Kronos.prototype.setYearMarkup = function () {
        var _ = this;

        _.$yearLayerBody.empty();
        for (var i = _.initial.thisY - 4; i <= _.initial.thisY + 4; i++) {
            _.$yearLayerBody.append('<button class="'+(_.initial.thisY == i ? 'kronos-active' : '')+'">'+i+'</button>');
        }
        _.$btnYear = _.$yearLayerBody.children('button');

        _.$btnYear.on('click', function (e) {
            e.stopPropagation();
            _.initial.date.setFullYear($(this).text());
            _.setDatepicker();
        });
    }

    Kronos.prototype.setDateClass = function () {
        var _ = this;

        _.$date = _.$body.find('td').removeClass();
        _.$date.each(function () {
            this.index = $(this).index();
            this.core = $(this).find('button').attr('core');
            this.mmdd = String(this.core).substring(4, 8);

            this.Class = this.index === 0 ? 'sunday' : this.index === 6 ? 'satday' : ''; // 주말 체크
            this.Class += this.core === _.core.input
                || this.core === _.core.from
                || this.core === _.core.to
                ? ' selected' : '';
            this.Class += _.core.input && _.core.from && this.core > _.core.from && this.core < _.core.input
                || _.core.input && _.core.to && this.core < _.core.to && this.core > _.core.input
                ? ' period' : '';
            this.Class += this.core === _.core.today ? ' today' : '';
            this.Class += _.isolateCore(this.core, 'year+month') === _.str.prevYM
                || _.opt.disableWeekends && (this.index === 0 || this.index === 6)
                || _.isolateCore(this.core, 'year+month') === _.str.nextYM
                || _.core.from && this.core < _.core.from
                || _.core.to && this.core > _.core.to
                || _.opt.date.disabled.indexOf(this.core) !== -1
                || _.opt.date.disabled.indexOf(this.mmdd) !== -1
                ? ' disabled' : '';
            this.Class += _.opt.date.holiday.indexOf(this.core) !== -1
                || _.opt.date.holiday.indexOf(this.mmdd) !== -1
                ? ' holiday' : '';
            $(this).addClass(this.Class);
        });
    }

    Kronos.prototype.setVisible = function () {
        var _ = this;

        _.$outer.addClass('visible');
        _.setDatepicker();

        $(window).on('load', function () {
            if (_.$from) {
                _.$from.kronos('getCoreDate');
                _.$from.kronos('setDateClass');
            }
            if (_.$to) {
                _.$to.kronos('getCoreDate');
                _.$to.kronos('setDateClass');
            }
        });
    }

    Kronos.prototype.onOpenEvent = function () {
        var _ = this;

        if (!_.$outer.hasClass('open')) {
            _.$outer.addClass('open');
            _.setDatepicker();
            _.onCloseEvent();
        }
    }

    Kronos.prototype.onCloseEvent = function () {
        var _ = this;

        _.$outer.on(_.keyupEvent, function(e) {
            if (e.keyCode === 27) {
                console.log('2');
                _.closeDatepicker();
            }
        });

        $(document).on(_.clickEvent, function(e) {
            if (!$(e.target).closest(_.$outer[0]).length) {
                _.closeDatepicker();
            }
        });
    }

    Kronos.prototype.closeDatepicker = function () {
        var _ = this;

        console.log('close');

        _.$dateLayer.empty();
        _.$monthLayerBody.empty();
        _.$yearLayerBody.empty();
        _.$outer.removeClass('open');
        _.$outer.off(_.keyupEvent);
        $(document).off(_.clickEvent);
    }

    Kronos.prototype.onClickInput = function () {
        var _ = this;

        if (!_.opt.visible) {
            _.$input.on({
                'click': function () {
                    _.onOpenEvent();
                },
                'keypress': function(e) {
                    if (e.keyCode === 13) {
                        _.onOpenEvent();
                    }
                }
            });
        }

        if (_.opt.button.trigger) {
            _.$trigger.on({
                'click': function () {
                    _.onOpenEvent();
                }
            });
        }
    }

    Kronos.prototype.onClickDate = function () {
        var _ = this;

        _.$date.on('click', function () {
            if (!$(this).hasClass('disabled')) {
                _.$input.val(_.convertFormat(this.core)).attr({'core' : this.core});
                _.opt.onChange(this.core);
                if (_.opt.visible) {
                    _.getCoreDate();
                    _.setDateClass();
                    if (_.$from) {
                        _.$from.kronos('getCoreDate');
                        _.$from.kronos('setDateClass');
                    }
                    if (_.$to) {
                        _.$to.kronos('getCoreDate');
                        _.$to.kronos('setDateClass');
                    }
                } else {
                    console.log('3');
                    _.closeDatepicker();
                }
            }
        });
    }

    Kronos.prototype.onClickTitle = function () {
        var _ = this;

        if (_.$titleMonth) {
            _.$titleMonth.on('click', function () {
                _.$monthLayer.addClass('kronos-visible');
                _.$yearLayer.removeClass('kronos-visible');
            });
        }

        if (_.$titleYear) {
            _.$titleYear.on('click', function () {
                _.$yearLayer.addClass('kronos-visible');
                _.$monthLayer.removeClass('kronos-visible');
            });
        }
    }

    Kronos.prototype.onClickButton = function () {
        var _ = this;

        if (_.opt.button.month) {
            _.$btnPrevMonth.on('click', function () {
                _.initial.date.setMonth(_.initial.date.getMonth()-1);
                if (_.opt.select && _.initial.date.getFullYear() < _.initial.selectYearStart) {
                    _.initial.date.setMonth(_.initial.date.getMonth()+1)
                    return false;
                } else {
                    _.setDatepicker();
                }
            });

            _.$btnNextMonth.on('click', function () {
                _.initial.date.setMonth(_.initial.date.getMonth()+1);
                if (_.opt.select && _.initial.date.getFullYear() > _.initial.selectYearEnd) {
                    _.initial.date.setMonth(_.initial.date.getMonth()-1)
                    return false;
                } else {
                    _.setDatepicker();
                }
            });
        }

        if (_.opt.button.year) {
            _.$btnPrevYear.on('click', function () {
                _.initial.date.setFullYear(_.initial.thisY-1);
                if (_.opt.select && _.initial.thisY <= _.initial.selectYearStart) {
                    _.initial.date.setFullYear(_.initial.thisY);
                    return false;
                } else {
                    _.setDatepicker();
                }
            });

            _.$btnNextYear.on('click', function () {
                _.initial.date.setFullYear(_.initial.thisY+1);
                if (_.opt.select && _.initial.thisY >= _.initial.selectYearEnd) {
                    _.initial.date.setFullYear(_.initial.thisY);
                    return false;
                } else {
                    _.setDatepicker();
                }
            });
        }

        if (_.opt.button.today) {
            _.$btnToday.on('click', function () {
                if (_.initial.todayY === _.initial.thisY && _.initial.todayM === _.initial.thisM) {
                    return false;
                } else {
                    _.initial.date.setFullYear(_.initial.todayY);
                    _.initial.date.setMonth(_.initial.todayM);
                    _.setDatepicker();
                }
            });
        }
    }

    Kronos.prototype.onChangeSelect = function () {
        var _ = this;

        if (_.opt.select) {
            _.$selectYear.on('change', function () {
                _.initial.date.setFullYear($(this).val());
                _.setDatepicker();
            });

            _.$selectMonth.on('change', function () {
                _.initial.date.setMonth($(this).val()-1);
                _.setDatepicker();
            });
        }
    }

    Kronos.prototype.init = function () {
        var _ = this;

        _.checkFormat();
        _.getTodayDate();
        _.setLayout();
        _.inputInit();
        _.onClickInput();

        if (_.opt.visible) {
            _.setVisible();
        }

        _.initFlag = true;
    }

    $.fn.kronos = function () {
        var _ = this,
            o = arguments[0],
            s = Array.prototype.slice.call(arguments, 1),
            l = _.length,
            r;

        for(var i = 0; i < l; i++) {
            if (typeof o == 'object' || typeof o == 'undefined') {
                _[i].Kronos = new Kronos(_[i], o);
            } else {
                r = _[i].Kronos[o].apply(_[i].Kronos, s);
                if (typeof r != 'undefined') {
                    return r;
                }
            }
        }

        return _;
    }
}(jQuery));