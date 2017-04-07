import * as _ from 'lodash';
import {Component} from '@angular/core';
import {Data, DataService} from './data.service';

function isDataEqual(data1: Data, data2: Data): boolean {
    return _.isEqual(data1, data2);
}

function initData(unhandledData: Data): Data {
    let data = _.cloneDeep(unhandledData);

    data.project.peopleByFruit = _.groupBy(data.people, 'favoriteFruit');

    return data;
}

@Component({
    selector: 'vm-app',
    templateUrl: './app.template.html'
})
export class AppComponent {
    requestCount = this.dataService.requestCount;
    buildDesc = __BUILD_DESCRIPTION__;

    people = this.dataService.people
        .distinctUntilChanged(isDataEqual)
        .map(initData);

    constructor(private dataService: DataService) {
    }

    log() {
        this.people
            .subscribe(
                data => console.log('buka data', data),
                err => console.log('buka err', err),
                () => console.log('buka complete')
            );
    }

    setPolling(value: boolean) {
        if (value) this.dataService.start();
        else this.dataService.stop();
    }
}
