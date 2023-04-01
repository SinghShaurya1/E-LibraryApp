import * as React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ImageBackground,
  Image,
  ToastAndroid,
} from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import db from '../config';
import firebase from 'firebase';
const bgImg = require('../images/background2.png');
const appName = require('../images/appName.png');
const appIcon = require('../images/appIcon.png');
//console.log(db)
export default class TransactionScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      hasCameraPermissions: null,
      scanned: false,
      scannedData: '',
      domState: 'xyz',
      bookId: '',
      studentId: '',
      bookName: '',
      studentName: '',
    };
  }

  getCameraPermissions = async (state) => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      hasCameraPermissions: status == 'granted',
      domState: state,
      scannedData: '',
      scanned: false,
    });
  };
  handleBarCodeScan = async ({ type, data }) => {
    const { domState } = this.state;
    if (domState == 'bookId') {
      this.setState({
        bookId: data,
        domState: 'xyz',
        scanned: true,
      });
    } else if (domState == 'studentId') {
      this.setState({
        studentId: data,
        domState: 'xyz',
        scanned: true,
      });
    }
  };

  getBookData = async (bookId) => {
    bookId = bookId.trim();
    console.log(bookId);
    db.collection('books')
      .where('bookId', '==', bookId)
      .get()
      .then((snapShot) => {
        snapShot.docs.map((doc) => {
          this.setState({
            bookName: doc.data().bookName,
          });
        });
      });
    console.log(this.state.bookName);
  };

  isBookAvailable = async (bookId) => {
    const bookRef = await db
      .collection('books')
      .where('bookId', '==', bookId)
      .get();
    var transactionType = '';
    if (bookRef.docs.length == 0) {
      transactionType = false;
    } else {
      bookRef.docs.map((doc) => {
        transactionType = doc.data.isAvailable ? 'issue' : 'return';
      });
    }
    console.log(transactionType);
    return transactionType;
  };

  getStudentDetails = (studentId) => {
    studentId = studentId.trim();
    db.collection('students')
      .where('studentId', '==', studentId)
      .get()
      .then((snapShot) => {
        snapShot.docs.map((doc) => {
          this.setState({
            studentName: doc.data().studentName,
          });
        });
      });
    console.log(this.state.studentName);
  };

  bookIssue = async (bookId, studentId, bookName, studentName) => {
    db.collection('transactions').add({
      studentId: studentId,
      bookId: bookId,
      studentName: studentName,
      date: firebase.firestore.Timestamp.now().toDate(),
      transactionType: 'issued',
      bookName: bookName,
    });
    db.collection('books').doc(bookId).update({
      isAvailable: false,
    });
    db.collection('students')
      .doc(studentId)
      .update({
        issuedBooks: firebase.firestore.FieldValue.increment(1),
      });
    this.setState({
      studentId: '',
      bookId: '',
    });
  };

  checkStudentElgiblityForReturn = async (bookId, studentId) => {
    const transactionRef = await db
      .collection('transactions')
      .where('bookId', '==', bookId)
      .limit(1)
      .get();
    var isStudentEligible = '';
    transactionRef.docs.map((doc) => {
      var lastBookTransactions = doc.data();

      if (lastBookTransactions.studentId == studentId) {
        isStudentEligible = true;
      } else {
        isStudentEligible = false;
        TOASTANDROID.show(
          'this book is not issued by this student',
          TOASTANDROID.SHORT
        );
        this.setState({
          bookId: '',
          studentId: '',
        });
      }
    });
    return isStudentEligible;
  };

  checkStudentElgiblityForIssue = async (studentId) => {
    const studentRef = await db
      .collection('students')
      .where('studentId', '==', studentId)
      .get();
    var isStudentEligible = '';
    if (studentRef.docs.length == 0) {
      this.setState({
        bookId: '',
        studentId: '',
      });
      ToastAndroid.show(
        "the student id doesn't exists in data base",
        TOASTANDROID.SHORT
      );
      isStudentEligible = false;
    } else {
      studentRef.docs.map((doc) => {
        if (doc.data().issuedBooks < 2) {
          isStudentEligible = true;
        } else {
          isStudentEligible = false;
          ToastAndroid.show(
            'the student already have 2 books',
            ToastAndroid.SHORT
          );
          this.setState({
            bookId: '',
            studentId: '',
          });
        }
      });
    }
    return isStudentEligible;
  };

  bookReturn = (bookId, studentId, bookName, studentName) => {
    db.collection('transactions').add({
      studentId: studentId,
      bookId: bookId,
      studentName: studentName,
      date: firebase.firestore.Timestamp.now().toDate(),
      transactionType: 'returned',
      bookName: bookName,
    });
    db.collection('books').doc(bookId).update({
      isAvailable: true,
    });
    db.collection('students')
      .doc(studentId)
      .update({
        issuedBooks: firebase.firestore.FieldValue.increment(-1),
      });
    this.setState({
      bookId: '',
      studentId: '',
    });
  };

  handleTransaction = async () => {
    var { bookId, studentId } = this.state;

    await this.getBookData(bookId);
    await this.getStudentDetails(studentId);
    var transactionType = await this.isBookAvailable(bookId);
    console.log(transactionType);
    if (transactionType == false) {
      this.setState({
        bookId: '',
        studentId: '',
      });
      ToastAndroid.show(
        "this book doesn't exists in data base",
        ToastAndroid.SHORT
      );
      console.log("this book doesn't exists in data base");
    } else if (transactionType == 'issue') {
      var isElegible = await this.checkStudentElgiblityForIssue(studentId);
      if (isElegible == true) {
        var { bookName, studentName } = this.state;
        this.bookIssue(bookId, studentId, bookName, studentName);
        TOASTANDROID.show('book has been issued', TOASTANDROID.SHORT);
      }
    } else {
      var isElegible = await this.checkStudentElgiblityForReturn(
        bookId,
        studentId
      );
      if (isElegible == true) {
        var { bookName, studentName } = this.state;
        this.bookReturn(bookId, studentId, bookName, studentName);
        TOASTANDROID.show('book has been returned', TOASTANDROID.SHORT);
      }
    }

    //doesn't
    db.collection('books')
      .doc(bookId)
      .get()
      .then((doc) => {
        var book = doc.data();
        console.log(book);
        if (book.isAvailable === true) {
          var { bookName, studentName } = this.state;
          console.log('book is available');
          this.bookIssue(bookId, studentId, bookName, studentName);
          ToastAndroid.show('book issued to student', ToastAndroid.SHORT);
        } else {
          var { bookName, studentName } = this.state;
          this.bookReturn(bookId, studentId, bookName, studentName);
          ToastAndroid.show('book retured by student', ToastAndroid.SHORT);
        }
      });
  };

  render() {
    const { domState, scannedData, scanned, hasCameraPermissions } = this.state;
    if (domState !== 'xyz') {
      return (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : this.handleBarCodeScan}
          style={StyleSheet.absoluteFillObject}
        />
      );
    }
    return (
      <View style={styles.container}>
        <ImageBackground source={bgImg} style={styles.bgImage} />
        <View style={styles.upperContainer}>
          <Image source={appIcon} style={styles.appIcon} />
          <Image source={appName} style={styles.appName} />
        </View>
        <View style={styles.lowerContainer}>
          <View style={styles.textinputContainer}>
            <TextInput
              style={styles.textinput}
              placeholder={'book Id'}
              value={this.state.bookId}
              onChangeText={(text) => {
                this.setState({
                  bookId: text,
                });
              }}
            />
            <TouchableOpacity
              style={styles.scanbutton}
              onPress={() => {
                this.getCameraPermissions('bookId');
              }}>
              <Text style={styles.scanbuttonText}>Scan QR</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.textinputContainer, { marginTop: 20 }]}>
            <TextInput
              style={styles.textinput}
              placeholder={'Student Id'}
              value={this.state.studentId}
              onChangeText={(input) => {
                this.setState({
                  studentId: input,
                });
              }}
            />
            <TouchableOpacity
              style={styles.scanbutton}
              onPress={() => {
                this.getCameraPermissions('studentId');
              }}>
              <Text style={styles.scanbuttonText}>Scan QR</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => {
              this.handleTransaction();
            }}
            style={[styles.button, { marginTop: 10 }]}>
            <Text style={styles.buttonText}>Enter</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  bgImage: { flex: 1, resizeMode: 'cover', justifyContent: 'center' },
  upperContainer: { flex: 0.2, justifyContent: 'center', alignItems: 'center' },
  appIcon: { width: 100, height: 100, resizeMode: 'contain', marginTop: 0 },
  appName: { width: 80, height: 80, resizeMode: 'contain' },
  lowerContainer: { flex: 0.8, alignItems: 'center' },
  textinputContainer: {
    borderWidth: 2,
    borderRadius: 10,
    flexDirection: 'row',
    backgroundColor: '#9DFD24',
    borderColor: '#FFFFFF',
  },
  textinput: {
    width: '57%',
    height: 50,
    padding: 10,
    borderColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 3,
    fontSize: 18,
    backgroundColor: '#5653D4',
    fontFamily: 'Rajdhani_600SemiBold',
    color: '#FFFFFF',
  },
  scanbutton: {
    width: 100,
    height: 50,
    backgroundColor: '#9DFD24',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanbuttonText: {
    fontSize: 24,
    color: '#0A0101',
    fontFamily: 'Rajdhani_600SemiBold',
  },
  button: {
    width: '43%',
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F48D20',
    borderRadius: 15,
  },
  buttonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: 'Rajdhani_600SemiBold',
  },
});
