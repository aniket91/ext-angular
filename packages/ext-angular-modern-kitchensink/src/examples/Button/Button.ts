import {Component, OnInit, OnChanges , ElementRef, Renderer, ViewChild, SimpleChanges, Input} from '@angular/core'

declare var Ext: any;

@Component({
  selector: 'button-component',
  templateUrl: "./Button.html",
  styles: [``]
})
export class ButtonComponent implements OnInit, OnChanges  {


  @Input()
  style = 'Menu';
  @Input()
  type = 'Text';
  @Input()
  round = true;
  @Input()
  iconCls;
  @Input()
  ui;
  @Input()
  menu;
  @Input()
  refreshFlag:boolean;

  onStyleChange = function(item){
    //debugger;
    console.log("onStyleChange : " + item._text);
    this.style = item._text; 
    this.refreshFlag = !this.refreshFlag;
  }

  onTypeChange = function(item){
    //debugger;
    console.log("onTypeChange : " + item._text);
    this.type = item._text; 
    this.refreshFlag = !this.refreshFlag;
  }

  toggleRound = function(){
    //debugger;
    console.log("In toggleRound");
    this.round=!this.round;
    this.refreshFlag = !this.refreshFlag;
    console.log("Round: " + this.round);
  };

  @ViewChild('layoutProps') layoutProps: ElementRef;

  @ViewChild('groupLabelProps1') groupLabelProps1: ElementRef;
  @ViewChild('groupLabelProps2') groupLabelProps2: ElementRef;
  @ViewChild('groupLabelProps3') groupLabelProps3: ElementRef;
  @ViewChild('groupLabelProps4') groupLabelProps4: ElementRef;

  @ViewChild('buttonGroupProps1') buttonGroupProps1: ElementRef;
  @ViewChild('buttonGroupProps2') buttonGroupProps2: ElementRef;
  @ViewChild('buttonGroupProps3') buttonGroupProps3: ElementRef;
  @ViewChild('buttonGroupProps4') buttonGroupProps4: ElementRef;
  


  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...\
    console.log("In ngOnChanges. changes : " + changes);
    for (let propName in changes) {
      let chng = changes[propName];
      let cur  = JSON.stringify(chng.currentValue);
      let prev = JSON.stringify(chng.previousValue);
      console.log("cur : " + cur + " prev : " + prev );
    }
  }


  ngOnInit() {

    this.refreshFlag = false;

    this.iconCls = this.type.indexOf('Icon') !== -1 ? 'x-fa fa-heart' : null;
    if (this.round) {
      this.ui += ' round';
    }

    if (this.style === 'Menu') {
      this.menu = '<menu [indented]="false"><menuitem text="Item 1"></menuitem><menuitem text="Item 2"/></menuitem><menuitem text="Item 3"></menuitem></menu>';
  } else {
      this.ui = this.style.toLowerCase();
  }

    console.log(this.groupLabelProps1.nativeElement.attributes['flex'].value);
    this.groupLabelProps1.nativeElement.setAttribute("test","a");
    console.log(this.groupLabelProps1.nativeElement.attributes['test'].value);

    console.log(this.layoutPropsVal);

    
        //this does not work for extjs components
    Object.keys(this.layoutPropsVal).forEach( (propName) => {
      //console.log("layoutProps");
      //this.layoutProps.nativeElement.setAttribute(propName, this.layoutPropsVal[propName]);
    });

    //this works since this is not a not extjs component
    console.log(this.groupLabelPropsVal);
    Object.keys(this.groupLabelPropsVal).forEach( (propName) => {
     // console.log("groupLabelProps1");
   //   this.groupLabelProps1.nativeElement.setAttribute(propName, this.groupLabelPropsVal[propName]);
    //  console.log("groupLabelProps2");
   //   this.groupLabelProps2.nativeElement.setAttribute(propName, this.groupLabelPropsVal[propName]);
    //  console.log("groupLabelProps3");
    //  this.groupLabelProps3.nativeElement.setAttribute(propName, this.groupLabelPropsVal[propName]);
    //  console.log("groupLabelProps4");
    //  this.groupLabelProps4.nativeElement.setAttribute(propName, this.groupLabelPropsVal[propName]);
    });



    //this does not work for extjs components
    console.log(this.buttonGroupPropsVal);
    Object.keys(this.buttonGroupPropsVal).forEach( (propName) => {
      //console.log("buttonGroupProps1");
      //this.buttonGroupProps1.nativeElement.setAttribute(propName, this.buttonGroupPropsVal[propName]);
      //console.log("buttonGroupProps2");
      //this.buttonGroupProps2.nativeElement.setAttribute(propName, this.buttonGroupPropsVal[propName]);
      //console.log("buttonGroupProps3");
      //this.buttonGroupProps3.nativeElement.setAttribute(propName, this.buttonGroupPropsVal[propName]);
      //console.log("buttonGroupProps4");
      //this.buttonGroupProps4.nativeElement.setAttribute(propName, this.buttonGroupPropsVal[propName]);
    });

    
  }

  // [height] = "'100%'" [width] = "'100%'" className = "demo-buttons" defaults={margin: '20'}
  // [padding] = "10" [shadow] = "true" defaults={layout: 'hbox', flex:1, margin: '10', width: '100%'}
  layoutPropsVal = Ext.os.is.Phone ? {
    height: '100%',
    width: '100%',
    className: 'demo-buttons',
    defaults: {
      margin: '20'
    }
  } : {
      padding: 10,
      shadow: true,
      defaults: {
        layout: 'hbox',
        flex: 1,
        margin: '10',
        width: '100%'
      }
    }

    // padding= '17 0 17 20' layout= "{ type: 'hbox', align: 'middle', pack: 'space-around' }" flex=1 margin='0 20 0 0' width=400 defaults="{margin: '0 20 0 0'}"
  buttonGroupPropsVal = Ext.os.is.Phone ? {
    padding: '20 0 0 20',
    defaults: {
      margin: '0 20 20 0',
      width: 'calc(50% - 20px)',
    }
  } : {
      padding: '17 0 17 20',
      layout: { type: 'hbox', align: 'middle', pack: 'space-around' },
      flex: 1,
      margin: '0 20 0 0',
      width: 400,
      defaults: {
        margin: '0 20 0 0'
      }
    }

  // width='70px' textAlign='right' margin='24px 20px 0 0'
  groupLabelPropsVal = Ext.os.is.Phone ? {
    style: {
      margin: '0 0 5px 0'
    }
  } : {
      style: {
        width: '70px',
        textAlign: 'right',
        margin: '24px 20px 0 0'
      }
    };

}