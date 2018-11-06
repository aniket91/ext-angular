import { Component, OnInit } from '@angular/core';
import {navTreeRoot} from '../../../examples/index';


@Component({
  selector: 'app-landingpage',
  templateUrl: './landingpage.component.html',
  styleUrls: ['./landingpage.component.css']
})
export class LandingpageComponent implements OnInit {

  treeStore = Ext.create('Ext.data.TreeStore', {
    rootVisible: true,
    root: navTreeRoot
  });

  constructor() { }

  ngOnInit() {

  }

  filterRegex;
  showTreeFlag = true;

  toggleTree = function(){
    console.log("toggleTree");
    this.showTreeFlag = !this.showTreeFlag;
  }

  filterNav(){
    console.log("In filterNav1");
  }

  filterNav1(field, value) {
    console.log("In filterNav");
    const store = this.treeStore;
    this.filterRegex = new RegExp(`(${Ext.String.escapeRegex(value)})`, 'i');
    store.filterBy(record => this.containsMatches(record));
  }

  containsMatches(node) {
    const found = node.data.name.match(this.filterRegex) || node.childNodes.some(child => this.containsMatches(child));
    if (found) node.expand();
    node.data.text = node.data.name.replace(this.filterRegex, '<span style="color:#2196F3;font-weight:bold">$1</span>')
    return found;
  }

  selectionChanged(tree, node) {
    console.log("Selection changed!");
  }

}
