import { Component, OnInit, ChangeDetectorRef, ViewChild, ViewContainerRef, ComponentFactoryResolver, ComponentRef, ComponentFactory } from '@angular/core';
import {navTreeRoot} from '../../../examples/index';

import { Location } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';

import {ButtonComponent} from '../../../examples/Button/Button';

declare var Ext: any;

@Component({
  selector: 'app-landingpage',
  templateUrl: 'landingpage.component.html',
  styleUrls: ['./landingpage.component.css']
})
export class LandingpageComponent implements OnInit {

  //code = window._code;
  
  treeStore = Ext.create('Ext.data.TreeStore', {
    rootVisible: true,
    root: navTreeRoot
  });

  nodeId;
  selectedNavNode;
  component;
  layout = "fit";
  files;


  nodeText;
  nodeItems = [];

  componentRef: any;

  @ViewChild('examplesContainer', { read: ViewContainerRef }) entry: ViewContainerRef;


  constructor(location: Location, router: Router, changeDetectorRef: ChangeDetectorRef,
    private resolver: ComponentFactoryResolver) { 
    router.events.subscribe((val) => {
      if(val instanceof NavigationEnd) {
        console.log(location.path(true));
        console.log(val);
        var path = location.path(true);
        if(path){
          this.nodeId = path.substring(path.indexOf("#")+1, path.length);
          console.log("nodeId : " + this.nodeId);
          this.selectedNavNode = this.treeStore.getNodeById(this.nodeId);
          console.log(this.selectedNavNode);
          if(this.selectedNavNode != null) {
            this.nodeText = this.selectedNavNode.get('text');
            console.log("this.nodeText : " + this.nodeText);
            this.nodeItems.unshift(
            );
  
            this.component = this.selectedNavNode.get('component');
            console.log("Component: " + this.component);
            if(this.selectedNavNode.get('layout') != null) {
              //this.layout = this.selectedNavNode.get('layout');
              //console.log("this.layout : " + this.layout);
            }
            //this.files = this.code[this.nodeText.replace(/\s/g, '')];
            //console.log("this.files : " + this.files);
          }
          else {
              console.log("selectedNavNode not found.")
          }
          //this.createComponent(null);

        }

      }

    })

  }

  gridcolumns = [
		{ text: 'Name', width: 250, dataIndex: 'name' },
		{ text: 'Email Address', flex: 1, dataIndex: 'email' },
		{ text: 'Phone Number', width: 250, dataIndex: 'phone' }
	];

	gridstore = {
		fields: ['name', 'email', 'phone'],
		data: [
			{ name: 'Lisa', email: 'lisa@simpsons.com', phone: '555-111-1224' },
			{ name: 'Bart', email: 'bart@simpsons.com', phone: '555-222-1234' },
			{ name: 'Homer', email: 'homer@simpsons.com', phone: '555-222-1244' },
			{ name: 'Marge', email: 'marge@simpsons.com', phone: '555-222-1254' }
		]
	};

	private onGridSelect({record}) {
		alert(record.data.name);
	}

  createComponent(message) {
    console.log("In createComponent. message : " + message);
    this.entry.clear();
    const factory = this.resolver.resolveComponentFactory(ButtonComponent);
    this.componentRef = this.entry.createComponent(factory);
    console.log(this.componentRef);
    this.componentRef.instance.message = message;
  }


  destroyComponent() {
    console.log("In destroyComponent.");
    this.componentRef.destroy();
  }

  ngOnInit() {

  } 

  filterRegex;
  showTreeFlag = true;
  

  toggleTree = function(){
    console.log("toggleTree. Before showTreeFlag : " + this.showTreeFlag);
    this.showTreeFlag = !this.showTreeFlag;
    console.log("toggleTree. After showTreeFlag : " + this.showTreeFlag);
  }

  filterNav(){
    console.log("In filterNav1");
  }

  filterNav1(field, value) {
    console.log("In filterNav");
    const store = this.treeStore;
    var escapeRegex = Ext.String.escapeRegex(value);
    console.log(escapeRegex);
    this.filterRegex = new RegExp(`(escapeRegex)`, 'i');
    store.filterBy(record => this.containsMatches(record));
    
  }

  containsMatches(node) {
    const found = node.data.name.match(this.filterRegex) || node.childNodes.some(child => this.containsMatches(child));
    if (found) node.expand();
    node.data.text = node.data.name.replace(this.filterRegex, '<span style="color:#2196F3;font-weight:bold">$1</span>')
    return found;
  }

  selectionChanged(tree, node) {
    console.log("Selection changed!. Tree : " + tree + " node : " + node);
  }

  navigate(node) {
    console.log("In naviagte : " + node.getId());
    //debugger;
  }

}
