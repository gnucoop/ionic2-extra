/*import {
  async,
  beforeEachProviders,
  describe,
  it,
  expect,
  beforeEach,
  fakeAsync,
  inject
} from '@angular/core/testing';
import { ComponentFixture, TestComponentBuilder } from '@angular/compiler/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import {
  disableDeprecatedForms,
  REACTIVE_FORM_DIRECTIVES,
  provideForms
} from '@angular/forms';
import {
  IonCalendar,
  IonCalendarPeriod,
  ION_CALENDAR_DIRECTIVES
} from './calendar';

import * as moment from 'moment';

describe('IonCalendar', () => {
  let builder: TestComponentBuilder;

  beforeEachProviders(() => [
    disableDeprecatedForms(),
    provideForms()
  ]);

  describe('basic behaviors', () => {
    let fixture: ComponentFixture<IonCalendarBasicTestComponent>;

    beforeEach(inject([TestComponentBuilder], function (tcb: TestComponentBuilder) {
      builder = tcb;
    }));

    beforeEach(async(() => {
      builder.createAsync(IonCalendarBasicTestComponent).then(f => {
        fixture = f;
        fixture.detectChanges();
      });
    }));

    it('creates an action header and entry rows', () => {
      let calendarItem = fixture.debugElement.query(By.directive(IonCalendar));
      expect(calendarItem.query(By.css('.ion-calendar-header'))).toBeTruthy();
      expect(calendarItem.query(By.css('.ion-calendar-row'))).toBeTruthy();
    });

    it('should display the current month', () => {
      let calendarItem = fixture.debugElement.query(By.directive(IonCalendar));
      let calendarRows = calendarItem.queryAll(By.css('.ion-calendar-row'));

      let startDate = moment().startOf('month').startOf('week');
      let endDate = moment().endOf('month').endOf('week').add(1, 'day');
      expect(calendarRows.length).toBe(endDate.diff(startDate, 'weeks') + 1);

      let curDate = startDate.clone();
      let rowIdx: number = 1;
      let colIdx: number = 0;
      let curRow = calendarRows[rowIdx];
      while (curRow != null && curDate.isBefore(endDate)) {
        if (colIdx >= curRow.children.length) {
          curRow = calendarRows[++rowIdx];
          colIdx = 0;
        }
        if (curRow != null) {
          expect(parseInt(curRow.children[colIdx]
            .query(By.css('.md-button-wrapper')).nativeElement.innerHTML, 10))
            .toBe(curDate.date());
          colIdx++;
          curDate.add(1, 'day');
        }
      }
    });

    it('supports ngModel', fakeAsync(() => {
      let instance = fixture.componentInstance;
      let component = fixture.debugElement.query(By.directive(IonCalendar)).componentInstance;

      let curDate = new Date();
      instance.model = <IonCalendarPeriod>{
        type: 'day',
        startDate: curDate,
        endDate: curDate
      };

      fixture.detectChanges();

      let selected = fixture.debugElement.queryAll(By.css('button.md-warn'));
      expect(selected.length).toEqual(1);
      expect(parseInt(selected[0].nativeElement.children[0].innerHTML, 10))
        .toEqual(curDate.getDate());

      curDate = moment(curDate).add(1, 'day').toDate();
      component.value = <IonCalendarPeriod>{
        type: 'day',
        startDate: curDate,
        endDate: curDate
      };

      fixture.detectChanges();

      selected = fixture.debugElement.queryAll(By.css('button.md-warn'));
      expect(selected.length).toEqual(1);
      expect(parseInt(selected[0].nativeElement.children[0].innerHTML, 10))
        .toEqual(curDate.getDate());
    }));
  });

  describe('year view', () => {
    let fixture: ComponentFixture<IonCalendarMonthViewTestComponent>;

    beforeEach(inject([TestComponentBuilder], function (tcb: TestComponentBuilder) {
      builder = tcb;
    }));

    beforeEach(async(() => {
      builder.createAsync(IonCalendarMonthViewTestComponent).then(f => {
        fixture = f;
        fixture.detectChanges();
      });
    }));

    it('should display the current year', () => {
      let calendarItem = fixture.debugElement.query(By.directive(IonCalendar));
      let calendarRows = calendarItem.queryAll(By.css('.ion-calendar-row'));

      let startDate = moment().startOf('year');
      let endDate = moment().endOf('year').add(1, 'day');
      let totalEntries: number = 0;
      for (let i = 0 ; i < calendarRows.length ; i++) {
        totalEntries += calendarRows[i].queryAll(By.css('button')).length;
      }
      expect(totalEntries).toBe(12);

      let curDate = startDate.clone();
      let rowIdx: number = 0;
      let colIdx: number = 0;
      let curRow = calendarRows[rowIdx];
      while (curRow != null && curDate.isBefore(endDate)) {
        if (colIdx >= curRow.children.length) {
          curRow = calendarRows[++rowIdx];
          colIdx = 0;
        }
        if (curRow != null) {
          expect(curRow.children[colIdx]
            .query(By.css('.md-button-wrapper')).nativeElement.innerHTML.trim())
            .toBe(curDate.format('MMM'));
          colIdx++;
          curDate.add(1, 'month');
        }
      }
    });
  });
});

@Component({
  selector: 'ion-calendar-test-component',
  directives: [REACTIVE_FORM_DIRECTIVES, ION_CALENDAR_DIRECTIVES],
  template: `<ion-calendar [(ngModel)]="model"></ion-calendar>`
})
class IonCalendarBasicTestComponent {
  model: IonCalendarPeriod;
}

@Component({
  selector: 'ion-calendar-test-component',
  directives: [ION_CALENDAR_DIRECTIVES],
  template: `<ion-calendar view-mode="year"></ion-calendar>`
})
class IonCalendarMonthViewTestComponent {
}
*/
