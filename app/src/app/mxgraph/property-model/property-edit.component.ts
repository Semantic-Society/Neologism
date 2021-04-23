import { Component, OnInit, Input } from '@angular/core';
import { Properties, Classes } from '../../../../api/collections';
import { Iclass, Iproperty } from '../../../../api/models';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { MeteorObservable } from 'meteor-rxjs';

@Component({
  selector: 'app-update-prop-modal',
  templateUrl: './property-edit.component.html',
})
export class PropertyEditModal implements OnInit {
  @Input() propListString: string;

  propList: Array<Iproperty>
  propListName: Array<string>
  propSourceNodeId: string
  public prop: Iproperty

  classes: Array<Iclass>

  constructor(private modal: NzModalRef) { }

  ngOnInit() {
    this.propList = []
    this.propListName = []
    this.propListString.split(',').forEach(key => {
      const prop = Properties.findOne({ _id: key })
      this.propList.push(prop)
    })
    this.classes = Classes.find({}).fetch()
    this.prop=this.propList[0]
    this.selectedProp = this.prop._id
  }

  selectedProp: string;

  closeModal(): void {
    MeteorObservable.call('property.update', this.prop._id, this.prop.name, this.prop.description, encodeURIComponent(this.prop.URI), this.prop.range).subscribe((response) => {
      // Handle success and response from server!
      console.log("updated");

    }, (err) => {
      console.log(err);
    });
    this.modal.destroy();
  }


  deleteProp(): void {
    MeteorObservable.call('property.delete', this.prop._id,this.propSourceNodeId).subscribe((response) => {
      // Handle success and response from server!
      console.log("delted");

    }, (err) => {
      console.log(err);
    });
    this.modal.destroy();
  }

  propChange(_id: string) {
    this.prop = this.propList.find(x => x._id == _id)
  }


}
