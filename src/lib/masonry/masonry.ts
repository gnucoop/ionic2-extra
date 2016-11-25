import {
  Component,
  ModuleWithProviders,
  NgModule,
  ViewEncapsulation
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  moduleId: module.id,
  selector: 'ion-masonry',
  host: {'role': 'list'},
  template: '<ng-content></ng-content>',
  styleUrls: ['masonry.css'],
  encapsulation: ViewEncapsulation.None
})
export class IonMasonry { }

@Component({
  moduleId: module.id,
  selector: 'ion-masonry-row',
  template: '<ng-content></ng-content>'
})
export class IonMasonryRow { }

@Component({
  moduleId: module.id,
  selector: 'ion-masonry-item',
  host: { 'role': 'listitem' },
  template: '<ng-content></ng-content>',
  encapsulation: ViewEncapsulation.None
})
export class IonMasonryItem {
}

export const ION_MASONRY_DIRECTIVES = [IonMasonry, IonMasonryRow, IonMasonryItem];

@NgModule({
  imports: [CommonModule],
  exports: ION_MASONRY_DIRECTIVES,
  declarations: ION_MASONRY_DIRECTIVES,
  providers: []
})
export class IonMasonryModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IonMasonryModule,
      providers: []
    };
  }
}
