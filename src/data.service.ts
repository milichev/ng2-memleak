import {Injectable} from '@angular/core';
import {Observable, Subject, BehaviorSubject} from 'rxjs/Rx';
import {Http} from '@angular/http';
import * as _ from 'lodash';

const peopleServiceUrl = require('../response.people.json');
const projectServiceUrl = require('../response.project.json');
// const peopleServiceUrl = 'http://beta.json-generator.com/api/json/get/V1n9lzs2M?indent=2';
// const projectServiceUrl = 'http://beta.json-generator.com/api/json/get/4kuQPQjhM?indent=2';

const pollInterval = 5;

export interface Data {
    people: any[],
    project: any
}


@Injectable()
export class DataService {
    public people: Observable<Data>;
    public requestCount: Observable<number>;

    private pollState = new BehaviorSubject<any>(false);
    private requestCountSink = new Subject<number>();

    constructor(private http: Http) {
        let intervalSink: Subject<any>;

        this.people = this.pollState
            .distinctUntilChanged()
            .switchMap(state => {

                if (intervalSink) {
                    intervalSink.complete();
                    intervalSink = undefined
                }

                if (!state) {
                    return Observable.empty();
                }

                intervalSink = new BehaviorSubject(1);

                return intervalSink.asObservable()
                    .flatMap(() => this.requestData())
                    .do(() => setTimeout(
                        () => intervalSink && !intervalSink.isStopped && intervalSink.next(1),
                        pollInterval));
            });

        this.requestCount = this.requestCountSink
            .map((v, i) => i);
    }

    start() {
        this.pollState.next(true);
    }

    stop() {
        this.pollState.next(false);
    }

    requestData(): Observable<Data> {
        return Observable
            .zip(
                this.requestPeople(),
                this.requestProject(),

                (people, project) => ({people, project})
            )
            .share();
    }

    requestPeople() {
        this.requestCountSink.next(0);
        return this.http.get(peopleServiceUrl)
            .map(response => {
                const people = response.json() as any[];
                return _.shuffle(people);
            })
            .share();
    }

    requestProject() {
        this.requestCountSink.next(0);
        return this.http.get(projectServiceUrl)
            .map(response => response.json())
            .share();
    }
}
