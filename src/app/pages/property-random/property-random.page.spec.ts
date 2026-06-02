import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PropertyRandomPage } from './property-random.page';

describe('PropertyRandomPage', () => {
  let component: PropertyRandomPage;
  let fixture: ComponentFixture<PropertyRandomPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PropertyRandomPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyRandomPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
