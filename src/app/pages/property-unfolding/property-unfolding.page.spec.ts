import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PropertyUnfoldingPage } from './property-unfolding.page';

describe('PropertyUnfoldingPage', () => {
  let component: PropertyUnfoldingPage;
  let fixture: ComponentFixture<PropertyUnfoldingPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PropertyUnfoldingPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyUnfoldingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
