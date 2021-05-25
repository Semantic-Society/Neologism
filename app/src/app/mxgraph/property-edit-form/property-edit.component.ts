import { Component, OnInit, Input } from '@angular/core';
import { Properties, Classes } from '../../../../api/collections';
import { Iclass, Iproperty, PropertyType } from '../../../../api/models';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { MeteorObservable } from 'meteor-rxjs';
import { SpellCheckerService } from 'ngx-spellchecker';
import { HttpClient } from '@angular/common/http';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { VocabulariesService } from '../../services/vocabularies.service';

@Component({
  selector: 'app-update-prop-modal',
  templateUrl: './property-edit.component.html',
  providers: [SpellCheckerService]
})
export class PropertyEditModal implements OnInit {
  @Input() propListString: string;
  isDataTypeProp: boolean
  propList: Array<Iproperty>
  propListName: Array<string>
  propSourceNodeId: string
  public prop: Iproperty

  xsdDataTypes = [

    "anyURI",

    "base64Binary",

    "boolean",

    "byte",

    "date",

    "dateTime",

    "decimal",

    "derivationControl",

    "double",

    "duration",

    "ENTITIES",

    "ENTITY",

    "float",

    "gDay",

    "gMonth",

    "gMonthDay",

    "gYear",

    "gYearMonth",

    "hexBinary",

    "ID",

    "IDREF",

    "IDREFS",

    "int",

    "integer",

    "language",

    "long",

    "Name",

    "NCName",

    "negativeInteger",

    "NMTOKEN",

    "NMTOKENS",

    "nonNegativeInteger",

    "nonPositiveInteger",

    "normalizedString",

    "NOTATION",

    "positiveInteger",

    "QName",

    "short",

    "simpleDerivationSet",

    "string",

    "time",

    "token",

    "unsignedByte",

    "unsignedInt",

    "unsignedLong",

    "unsignedShort"

  ]

  fileURL = "https://raw.githubusercontent.com/JacobSamro/ngx-spellchecker/master/dict/normalized_en-US.dic"

  classes: Array<Iclass>

  public suggestions: string[]
  contextmenu: boolean = false

  constructor(private modal: NzModalRef,
    private spellCheckerService: SpellCheckerService,
    private httpClient: HttpClient,
    private vocabService: VocabulariesService) { }

  ngOnInit() {
    this.propList = []
    this.propListName = []
    this.propListString.split(',').forEach(key => {
      const prop = Properties.findOne({ _id: key })
      this.propList.push(prop)
    })
    this.classes = Classes.find({ isDataTypeVertex: { $exists: false } }).fetch()
    this.prop = this.propList[0]
    this.selectedProp = this.prop._id
    this.isDataTypeProp = this.prop.type === PropertyType.Data;
  }

  selectedProp: string;

  closeModal(): void {

    if (this.prop.type === PropertyType.Data) {
      
      this.prop.URI = `http://www.w3.org/2001/XMLSchema#${this.prop.rangeName}`
      this.vocabService.updateClassName(this.prop._id, this.prop.rangeName)
      this.vocabService.updateClassURI(this.prop._id, this.prop.URI);

      MeteorObservable.call('property.update', this.prop._id, this.prop.name, this.prop.description, this.prop.URI, this.prop._id).subscribe((response) => {
        // Handle success and response from server!
        console.log("updated");

      }, (err) => {
        console.log(err);
      });
    } else {
      MeteorObservable.call('property.update', this.prop._id, this.prop.name, this.prop.description, this.prop.URI, this.prop.range).subscribe((response) => {
        // Handle success and response from server!
        console.log("updated");

      }, (err) => {
        console.log(err);
      });
    }

    this.modal.destroy();
  }

  checkWord(word: string) {

    this.httpClient.get(this.fileURL, { responseType: 'text' }).subscribe((res: any) => {
      let dictionary = this.spellCheckerService.getDictionary(res)
      this.suggestions = dictionary.getSuggestions(word)
    })
    
    this.contextmenu = true
  }


  deleteProp(): void {

    if (this.prop.type === PropertyType.Data) {
      MeteorObservable.call('property.delete', this.prop._id, this.propSourceNodeId).subscribe((response) => {
        // Handle success and response from server!
      }, (err) => {
        console.log(err);
      });

      MeteorObservable.call('classes.delete', this.prop._id).subscribe((response) => {
        // Handle success and response from server!
      }, (err) => {
        console.log(err);
      });
    }
    else {
      MeteorObservable.call('property.delete', this.prop._id, this.propSourceNodeId).subscribe((response) => {
        // Handle success and response from server!
      }, (err) => {
        console.log(err);
      });
    }
    this.modal.destroy();
  }

  propChange(_id: string) {
    this.prop = this.propList.find(x => x._id == _id)
    this.isDataTypeProp = this.prop.type === PropertyType.Data;
  }


}
