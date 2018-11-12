import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {CalendarService} from '../Calendar.service';

declare var Ext: any;

@Component({
  selector: 'calendar-timezonesupport-component',
  templateUrl: './TimezoneSupport.html',
  styles: [``]
})
export class CalendarTimezoneSupportComponent implements OnInit {


  constructor(private calService: CalendarService) { 
      console.log("Calendar panel component constructor invoked");
  }

  ngOnInit() {

  }

}