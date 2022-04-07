import { Component, OnInit, Input } from '@angular/core';
import { Properties, Classes } from '../../../../api/collections';
import { Iclass, Iproperty, PropertyType, xsdDataTypes } from '../../../../api/models';
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

    constructor(private modal: NzModalRef,
        private spellCheckerService: SpellCheckerService,
        private httpClient: HttpClient,
        private vocabService: VocabulariesService) { }
    @Input() propListString: string;
    isDataTypeProp: boolean;
    propList: Iproperty[];
    propListName: string[];
    domainClassId: string;
    public prop: Iproperty;
    readonly xsdDataTypes = xsdDataTypes;

    fileURL = 'https://raw.githubusercontent.com/JacobSamro/ngx-spellchecker/master/dict/normalized_en-US.dic';

    classes: Iclass[];
    nonDataTypeClass: Iclass[];
    public suggestions: string[];
    contextmenu = false;

    selectedProp: string;

    ngOnInit() {
        this.propList = [];
        this.propListName = [];
        Classes.find({ _id: this.domainClassId }).fetch()[0]
            .properties
            .forEach(key => {
                const prop = Properties.findOne({ _id: key });
                this.propList.push(prop);
            });
        this.classes = Classes.find().fetch();
        this.nonDataTypeClass = this.classes.filter((x) => x.isDataTypeVertex === false)
        this.propChange(this.propList[0]._id)
    }

    closeModal(): void {

        if (this.prop.type === PropertyType.Data) {

            //   this.prop.URI = `http://www.w3.org/2001/XMLSchema#${this.prop.rangeName}`;
            this.vocabService.updateClassName(this.prop._id, this.prop.range);
            this.vocabService.updateClassURI(this.prop._id, this.prop.URI);

            MeteorObservable.call('property.update', this.prop._id, this.prop.name, this.prop.description, this.prop.URI, this.prop.range).subscribe((response) => {
                // Handle success and response from server!
                console.log('updated');

            }, (err) => {
                console.log(err);
            });
        } else {
            MeteorObservable.call('property.update', this.prop._id, this.prop.name, this.prop.description, this.prop.URI, this.prop.range).subscribe((response) => {
                // Handle success and response from server!
                console.log('updated');

            }, (err) => {
                console.log(err);
            });
        }

        //   this.modal.destroy();
    }

    checkWord(word: string) {

        this.httpClient.get(this.fileURL, { responseType: 'text' }).subscribe((res: any) => {
            const dictionary = this.spellCheckerService.getDictionary(res);
            this.suggestions = dictionary.getSuggestions(word);
        });

        this.contextmenu = true;
    }


    deleteProp() {
        let observable$ = null
        if (this.prop.type === PropertyType.Data) {
            observable$ = MeteorObservable.call('property.delete', this.prop._id, this.domainClassId)

            MeteorObservable.call('classes.delete', this.prop._id).subscribe((response) => {
                // Handle success and response from server!
            }, (err) => {
                console.log(err);
            });
        } else {
            observable$ = MeteorObservable.call('property.delete', this.prop._id, this.domainClassId)
        }
        return observable$
    }

    propChange(_id: string) {
        this.prop = this.propList.find(x => x._id == _id);
        this.isDataTypeProp = this.prop.type === PropertyType.Data;
        this.selectedProp = this.prop._id;
        return false;
    }


}
