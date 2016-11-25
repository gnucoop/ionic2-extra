import {
  AfterContentInit,
  Component,
  EventEmitter,
  forwardRef,
  Input,
  ModuleWithProviders,
  NgModule,
  OnInit,
  OnDestroy,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from 'ionic-angular';
import {
  NG_VALUE_ACCESSOR,
  ControlValueAccessor
} from '@angular/forms';

import { Observable } from 'rxjs/Observable';

import { Form } from 'ionic-angular';

import * as moment from 'moment';
const momentConstructor: (value?: any) => moment.Moment = (<any>moment).default || moment;

export const ION_CALENDAR_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => IonCalendar),
  multi: true
};

const weekDays: string[] = [
  '', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];

export type IonCalendarViewMode = ('month' | 'year' | 'decade');
export type IonCalendarPeriodType = ('day' | 'week' | 'month' | 'year');
export type IonCalendarEntryType = ('day' | 'month' | 'year');
export type IonCalendarWeekDay = (
  'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
);
export type IonCalendarEntrySelectedState = ('none' | 'partial' | 'full');

export class IonCalendarPeriod {
  type: IonCalendarPeriodType;
  startDate: Date;
  endDate: Date;
}

export class IonCalendarChange {
  source: IonCalendar;
  period: IonCalendarPeriod;
}

export class IonCalendarEntry {
  type: IonCalendarEntryType;
  date: Date;
  selected: IonCalendarEntrySelectedState;
  disabled: boolean = false;
  highlight: boolean = false;

  constructor(params: {
    type: IonCalendarEntryType,
    date: Date,
    selected: IonCalendarEntrySelectedState,
    highlight?: boolean,
    disabled?: boolean
  }) {
    let keys = Object.keys(params);

    this.type = params.type;
    this.date = params.date;
    this.selected = params.selected;
    if (keys.indexOf('disabled') > -1) {
      this.disabled = params.disabled;
    }
    if (keys.indexOf('highlight') > -1) {
      this.highlight = params.highlight;
    }
  }

  toString(): string {
    if (this.type === 'day') {
      return `${this.date.getDate()}`;
    }
    if (this.type === 'month') {
      return momentConstructor(this.date).format('MMM');
    }
    return `${this.date.getFullYear()}`;
  }

  getRange(): {start: moment.Moment, end: moment.Moment} {
    if (this.type === 'day') {
      let day: moment.Moment = momentConstructor(this.date);
      return {start: day, end: day};
    } else {
      let curMoment: moment.Moment = momentConstructor(this.date);
      return {
        start: curMoment.clone().startOf(this.type),
        end: curMoment.clone().endOf(this.type)
      };
    }
  }
}

@Component({
  moduleId: module.id,
  selector: 'ion-calendar',
  templateUrl: 'calendar.html',
  styleUrls: ['calendar.css'],
  providers: [ION_CALENDAR_CONTROL_VALUE_ACCESSOR]
})
export class IonCalendar implements AfterContentInit, ControlValueAccessor, OnInit, OnDestroy {
  @Output() ionChange: EventEmitter<IonCalendar> = new EventEmitter<IonCalendar>();

  get viewDate(): Date { return this._viewDate; };
  @Input('view-date')
  set viewDate(viewDate: Date) { this._setViewDate(viewDate); }

  private _disabled: boolean = false;
  get disabled(): boolean { return this._disabled; }
  @Input()
  set disabled(disabled: boolean) {
    this._disabled = disabled != null && `${disabled}` !== 'false';
  }

  private _dateOnlyForDay: boolean = false;
  get dateOnlyForDay(): boolean { return this._disabled; }
  @Input()
  set dateOnlyForDay(dateOnlyForDay: boolean) {
    this._dateOnlyForDay = dateOnlyForDay != null && `${dateOnlyForDay}` !== 'false';
  }

  private _viewMode: IonCalendarViewMode = 'month';
  get viewMode(): IonCalendarViewMode { return this._viewMode; }
  @Input('view-mode')
  set viewMode(viewMode: IonCalendarViewMode) {
    this._viewMode = viewMode;
    this._buildCalendar();
  }

  private _selectionMode: IonCalendarPeriodType = 'day';
  get selectionMode(): IonCalendarPeriodType { return this._selectionMode; }
  @Input('selection-mode')
  set selectionMode(selectionMode: IonCalendarPeriodType) {
    this._selectionMode = selectionMode;
  }

  private _startOfWeekDay: number = 1;
  get startOfWeekDay(): IonCalendarWeekDay {
    return <IonCalendarWeekDay>weekDays[this._startOfWeekDay];
  }
  @Input('start-of-week-day')
  set startOfWeekDay(weekDay: IonCalendarWeekDay) {
    this._startOfWeekDay = weekDays.indexOf(weekDay);

    (<any>moment).updateLocale(moment.locale(), { week: { dow: this._startOfWeekDay }});

    if (this._viewMode === 'month') {
      this._buildCalendar();
    }
  }

  private _minDate: Date;
  get minDate(): Date {
    return this._minDate;
  }
  @Input()
  set minDate(minDate: Date) {
    this._minDate = minDate != null ? new Date(minDate.valueOf()) : null;
  }

  private _maxDate: Date;
  get maxDate(): Date {
    return this._maxDate;
  }
  @Input()
  set maxDate(maxDate: Date) {
    this._maxDate = maxDate != null ? new Date(maxDate.valueOf()) : null;
  }

  private _change: EventEmitter<IonCalendarChange> = new EventEmitter<IonCalendarChange>();
  @Output()
  public change(): Observable<IonCalendarChange> { return this._change.asObservable(); }

  private _selectedPeriod: IonCalendarPeriod;
  private set selectedPeriod(period: IonCalendarPeriod) {
    this._selectedPeriod = period;
    this._change.emit({
      source: this,
      period: period
    });
    this._refreshSelection();
  }

  get value(): IonCalendarPeriod | Date {
    if (this._dateOnlyForDay && this.selectionMode === 'day') {
      return this._selectedPeriod != null ? this._selectedPeriod.startDate : null;
    }
    return this._selectedPeriod;
  }
  set value(period: IonCalendarPeriod | Date) {
    if (this._dateOnlyForDay && this.selectionMode === 'day') {
      if (period instanceof Date &&
          (this._selectedPeriod == null || period !== this._selectedPeriod.startDate)) {
        this.selectedPeriod = {
          type: 'day',
          startDate: period,
          endDate: period
        };
        if (this._init) {
          this.ionChange.emit(this);
        }
        this._onChangeCallback(period);
      }
    } else if (period instanceof Object && period !== this._selectedPeriod) {
        this.selectedPeriod = <IonCalendarPeriod>period;
        if (this._init) {
          this.ionChange.emit(this);
        }
        this._onChangeCallback(period);
    }
  }

  public get calendarRows(): IonCalendarEntry[][] { return this._calendarRows; }
  public get viewHeader(): string { return this._viewHeader; }
  public get weekDays(): string[] { return this._weekDays; }

  private _viewDate: Date = new Date();
  private _viewMoment: moment.Moment = momentConstructor();
  private _viewHeader: string = '';

  private _calendarRows: IonCalendarEntry[][] = [];
  private _weekDays: string[] = [];
  private _init: boolean;

  constructor(private _form: Form) {
    _form.register(this);
  }

  prevPage(): void {
    if (this._viewMode === 'month') {
      this.viewDate = momentConstructor(this.viewDate).subtract(1, 'M').toDate();
    } else if (this._viewMode === 'year') {
      this.viewDate = momentConstructor(this.viewDate).subtract(1, 'y').toDate();
    }
    this._buildCalendar();
  }

  nextPage(): void {
    if (this._viewMode === 'month') {
      this.viewDate = momentConstructor(this.viewDate).add(1, 'M').toDate();
    } else if (this._viewMode === 'year') {
      this.viewDate = momentConstructor(this.viewDate).add(1, 'y').toDate();
    }
    this._buildCalendar();
  }

  previousViewMode(): void {
    if (this._viewMode === 'decade') {
      return;
    } else if (this._viewMode === 'year') {
      this._viewMode = 'decade';
    } else if (this._viewMode === 'month') {
      this._viewMode = 'year';
    }
    this._buildCalendar();
  }

  selectEntry(entry: IonCalendarEntry): void {
    if (!this._canSelectEntry(entry)) {
      return this._nextViewMode(entry);
    }

    let newPeriod: IonCalendarPeriod | Date;
    if (this._isEntrySelected(entry) === 'full') {
      newPeriod = null;
    } else if (this._selectionMode === 'day') {
      if (this._dateOnlyForDay) {
        newPeriod = entry.date;
      } else {
        newPeriod = {
          type: 'day',
          startDate: entry.date,
          endDate: entry.date
        };
      }
    } else if (this._selectionMode === 'week') {
      newPeriod = {
        type: 'week',
        startDate: new Date(momentConstructor(entry.date).startOf('week').toDate().valueOf()),
        endDate: new Date(momentConstructor(entry.date).endOf('week').toDate().valueOf())
      };
    } else if (this._selectionMode === 'month') {
      newPeriod = {
        type: 'month',
        startDate: new Date(momentConstructor(entry.date).startOf('month').toDate().valueOf()),
        endDate: new Date(momentConstructor(entry.date).endOf('month').toDate().valueOf())
      };
    } else if (this._selectionMode === 'year') {
      newPeriod = {
        type: 'year',
        startDate: new Date(momentConstructor(entry.date).startOf('year').toDate().valueOf()),
        endDate: new Date(momentConstructor(entry.date).endOf('year').toDate().valueOf())
      };
    }
    this.value = newPeriod;
  }

  registerOnChange(fn: (value: any) => void) {
    this._onChangeCallback = fn;
  }

  registerOnTouched(fn: any) {
    this._onTouchedCallback = fn;
  }

  writeValue(value: any) {
    if (typeof value === 'string') {
      value = momentConstructor(value).toDate();
    }
    this.value = value;
  }

  ngOnInit(): void {
    this._buildCalendar();
  }

  ngAfterContentInit(): void {
    this._init = true;
    this._refreshSelection();
  }

  ngOnDestroy(): void {
    this._form.deregister(this);
  }

  private _onChangeCallback: (_: any) => void = (_: any) => {};
  private _onTouchedCallback: () => void = () => {};

  private _getMonthName(date: Date): string {
    return momentConstructor(date).format('MMM');
  }

  private _setViewDate(date: Date): void {
    this._viewDate = date;
    this._viewMoment = momentConstructor(date);
  }

  private _buildCalendar(): void {
    if (this._viewMode === 'month') {
      this._buildMonthView();
    } else if (this._viewMode === 'year') {
      this._buildYearView();
    } else if (this._viewMode === 'decade') {
      this._buildDecadeView();
    }
  }

  private _buildDecadeView(): void {
    let curYear: number = this._viewDate.getFullYear();
    let firstYear = curYear - (curYear % 10) + 1;
    let lastYear = firstYear + 11;

    this._viewHeader = `${firstYear} - ${lastYear}`;

    let curDate: moment.Moment = momentConstructor(this.viewDate)
      .startOf('year')
      .year(firstYear);

    let rows: IonCalendarEntry[][] = [];
    for (let i = 0 ; i < 4 ; i ++) {
      let row: IonCalendarEntry[] = [];
      for (let j = 0 ; j < 3 ; j ++) {
        let date = new Date(curDate.toDate().valueOf());
        let newEntry = new IonCalendarEntry({
          type: 'year',
          date: date,
          selected: 'none'
        });
        newEntry.selected = this._isEntrySelected(newEntry);
        row.push(newEntry);
        curDate.add(1, 'y');
      }
      rows.push(row);
    }
    this._calendarRows = rows;
  }

  private _buildYearView(): void {
    this._viewHeader = `${this._viewDate.getFullYear()}`;

    let curDate: moment.Moment = momentConstructor(this.viewDate)
      .startOf('year');

    let rows: IonCalendarEntry[][] = [];
    for (let i = 0 ; i < 4 ; i ++) {
      let row: IonCalendarEntry[] = [];
      for (let j = 0 ; j < 3 ; j ++) {
        let date = new Date(curDate.toDate().valueOf());
        let newEntry = new IonCalendarEntry({
          type: 'month',
          date: date,
          selected: 'none'
        });
        newEntry.selected = this._isEntrySelected(newEntry);
        row.push(newEntry);
        curDate.add(1, 'M');
      }
      rows.push(row);
    }
    this._calendarRows = rows;
  }

  private _buildMonthView(): void {
    this._viewHeader = momentConstructor(this._viewDate).format('MMM YYYY');

    this._buildMonthViewWeekDays();

    let viewStartDate: moment.Moment = momentConstructor(this.viewDate)
      .startOf('month')
      .startOf('week');
    let viewEndDate: moment.Moment = momentConstructor(this.viewDate)
      .endOf('month')
      .endOf('week');

    let rows: IonCalendarEntry[][] = [];
    let todayDate = momentConstructor();
    let curDate = momentConstructor(viewStartDate);
    let minDate = this.minDate == null ? null : momentConstructor(this.minDate);
    let maxDate = this.maxDate == null ? null : momentConstructor(this.maxDate);
    while (curDate < viewEndDate) {
      let row: IonCalendarEntry[] = [];
      for (let i = 0 ; i < 7 ; i++) {
        let disabled = (minDate != null && curDate.isBefore(minDate)) ||
          (maxDate != null && curDate.isAfter(maxDate));
        let date = new Date(curDate.toDate().valueOf());
        let newEntry: IonCalendarEntry = new IonCalendarEntry({
          type: 'day',
          date: date,
          selected: 'none',
          highlight: todayDate.format('YYYY-MM-DD') === curDate.format('YYYY-MM-DD'),
          disabled: disabled
        });
        newEntry.selected = this._isEntrySelected(newEntry);
        row.push(newEntry);
        curDate.add(1, 'd');
      }
      rows.push(row);
    }

    this._calendarRows = rows;
  }

  private _buildMonthViewWeekDays(): void {
    let curMoment = momentConstructor().startOf('week');
    let weekDayNames: string[] = [];
    for (let i = 0 ; i < 7 ; i++) {
      weekDayNames.push(curMoment.format('ddd'));
      curMoment.add(1, 'd');
    }
    this._weekDays = weekDayNames;
  }

  private _periodOrder(entryType: IonCalendarPeriodType): number {
    return ['day', 'week', 'month', 'year'].indexOf(entryType);
  }

  private _isEntrySelected(entry: IonCalendarEntry): IonCalendarEntrySelectedState {
    if (this._selectedPeriod != null && this._selectedPeriod.type != null &&
          this._selectedPeriod.startDate != null && this._selectedPeriod.endDate != null) {
      let selectionStart: moment.Moment = momentConstructor(this._selectedPeriod.startDate)
        .startOf('day');
      let selectionEnd: moment.Moment = momentConstructor(this._selectedPeriod.endDate)
        .endOf('day');
      let selectionPeriodOrder: number = this._periodOrder(this._selectedPeriod.type);

      let entryPeriodOrder: number = this._periodOrder(entry.type);
      let entryRange: {start: moment.Moment, end: moment.Moment} = entry.getRange();

      if (entryPeriodOrder <= selectionPeriodOrder &&
        entryRange.start.isBetween(selectionStart, selectionEnd, null, '[]') &&
        entryRange.end.isBetween(selectionStart, selectionEnd, null, '[]')
      ) {
        return 'full';
      } else if (entryPeriodOrder > selectionPeriodOrder &&
        selectionStart.isBetween(entryRange.start, entryRange.end, null, '[]') &&
        selectionEnd.isBetween(entryRange.start, entryRange.end, null, '[]')
      ) {
        return 'partial';
      }
    }

    return 'none';
  }

  private _refreshSelection(): void {
    for (let row of this._calendarRows) {
      for (let entry of row) {
        entry.selected = this._isEntrySelected(entry);
      }
    }
  }

  private _canSelectEntry(entry: IonCalendarEntry): boolean {
    if (['day', 'week'].indexOf(this._selectionMode) >= 0 && entry.type !== 'day') {
      return false;
    }
    if (this._selectionMode === 'month' && entry.type === 'year') {
      return false;
    }
    return true;
  }

  private _nextViewMode(entry: IonCalendarEntry): void {
    if (this._viewMode === 'decade') {
      this._viewMode = 'year';
    } else if (this._viewMode === 'year') {
      this._viewMode = 'month';
    } else if (this._viewMode === 'month') {
      return;
    }
    this._viewDate = entry.date;
    this._buildCalendar();
  }
}

export const ION_CALENDAR_DIRECTIVES = [IonCalendar];

@NgModule({
  imports: [CommonModule, IonicModule],
  exports: [IonCalendar],
  declarations: [IonCalendar],
  entryComponents: [IonCalendar],
  providers: []
})
export class IonCalendarModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IonCalendarModule,
      providers: []
    };
  }
}
