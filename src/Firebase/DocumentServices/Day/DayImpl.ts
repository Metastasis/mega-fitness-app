import moment from 'moment';
import Day from './Day';
import DayDocument from '../../Documents/DayDocument';

export default class DayImpl implements Day {
  firestore: firebase.firestore.Firestore;

  constructor(firestore: firebase.firestore.Firestore) {
    this.firestore = firestore;
  }

  createGoal(
    currentDate: Date,
    goalCalories: number,
    uid: string
  ): Promise<void> {
    const dayStartMoment = moment(currentDate).startOf('day');
    const date = dayStartMoment.toDate();
    const createdAt = new Date();
    return this.firestore
      .collection('days')
      .doc(
        uid +
          '-' +
          dayStartMoment.format('YYYY-MM-DD') +
          '-' +
          createdAt.getTime()
      )
      .set({
        date,
        goalCalories,
        uid,
        createdAt,
        deleted: false,
      });
  }

  updateGoal(
    currentDate: Date,
    goalCalories: number,
    uid: string,
    id: string
  ): Promise<void> {
    const date = moment(currentDate).startOf('day').toDate();
    const updatedAt = new Date();
    return this.firestore.collection('days').doc(id).update({
      date,
      goalCalories,
      uid,
      updatedAt,
      deleted: false,
    });
  }

  createWeight(currentDate: Date, weight: number, uid: string): Promise<void> {
    const dayStartMoment = moment(currentDate).startOf('day');
    const date = dayStartMoment.toDate();
    const createdAt = new Date();
    return this.firestore
      .collection('days')
      .doc(
        uid +
          '-' +
          dayStartMoment.format('YYYY-MM-DD') +
          '-' +
          createdAt.getTime()
      )
      .set({
        date,
        weight,
        uid,
        createdAt,
        deleted: false,
      });
  }

  updateWeight(
    currentDate: Date,
    weight: number,
    uid: string,
    id: string
  ): Promise<void> {
    const date = moment(currentDate).startOf('day').toDate();
    const updatedAt = new Date();
    return this.firestore.collection('days').doc(id).update({
      date,
      weight,
      uid,
      updatedAt,
      deleted: false,
    });
  }

  async findDocument(date: Date, uid: string): Promise<DayDocument> {
    const response = await this.getDocumentReference(date, uid).get();
    if (response.docs.length) {
      return response.docs.map(this.mapDocuments)[0];
    }
    return {
      id: null,
      goalCalories: null,
      date: null,
      weight: null,
    };
  }

  getDocumentListener(
    date: Date,
    uid: string,
    updateCallback: Function
  ): Function {
    return this.getDocumentReference(date, uid).onSnapshot((snapshot) => {
      const updatedDocs = snapshot.docs.map(this.mapDocuments)[0];
      updateCallback(updatedDocs);
    });
  }

  getDocumentReference(
    date: Date,
    uid: string
  ): firebase.firestore.Query<firebase.firestore.DocumentData> {
    return this.firestore
      .collection('days')
      .where('date', '==', moment(date).startOf('day').toDate())
      .where('uid', '==', uid)
      .where('deleted', '==', false)
      .limit(1);
  }

  async findByWeek(
    beginningOfWeek: Date,
    uid: string
  ): Promise<{ [key: string]: any }[]> {
    const response = await this.getByWeekRef(beginningOfWeek, uid).get();
    if (response.docs.length) {
      return response.docs.map(this.mapDocuments);
    }
    return [];
  }

  getByWeekRef(
    beginningOfWeek: Date,
    uid: string
  ): firebase.firestore.Query<firebase.firestore.DocumentData> {
    const start = moment(beginningOfWeek).startOf('isoWeek');
    const end = start.clone().endOf('isoWeek');
    return this.firestore
      .collection('days')
      .where('date', '>=', start.toDate())
      .where('date', '<', end.toDate())
      .where('uid', '==', uid)
      .where('deleted', '==', false);
  }

  async findByMonth(
    beginningOfMonth: Date,
    uid: string
  ): Promise<{ [key: string]: any }[]> {
    const response = await this.getByMonthRef(beginningOfMonth, uid).get();
    if (response.docs.length) {
      return response.docs.map(this.mapDocuments);
    }
    return [];
  }

  getByMonthRef(
    beginningOfWeek: Date,
    uid: string
  ): firebase.firestore.Query<firebase.firestore.DocumentData> {
    const start = moment(beginningOfWeek).startOf('month');
    const end = start.clone().endOf('month');
    return this.firestore
      .collection('days')
      .where('date', '>=', start.toDate())
      .where('date', '<', end.toDate())
      .where('uid', '==', uid)
      .where('deleted', '==', false);
  }

  mapDocuments(
    document: firebase.firestore.QueryDocumentSnapshot<
      firebase.firestore.DocumentData
    >
  ): DayDocument {
    const data = document.data();
    return {
      id: document.id,
      goalCalories: data.goalCalories,
      date: data.date.toDate(),
      weight: data.weight,
    };
  }
}
