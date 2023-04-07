import * as React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import * as Permissions from 'expo-permissions';
import db from '../config';
import { ListItem } from 'react-native-elements';

export default class SearchScreen extends React.Component {
  constructor() {
    super();

    this.state = {
      searchText: '',
      alltransactions: [],
      lastVisibeleTransaction: null,
    };
  }
  componentDidMount() {
    this.getTransactions();
  }
  getTransactions = async () => {
    await db
      .collection('transactions')
      .limit(10)
      .get()
      .then((snapShot) => {
        console.log(snapShot);
        snapShot.docs.map((doc) => {
          console.log(doc.data());
          this.setState({
            alltransactions: [...this.state.alltransactions, doc.data()],
            lastVisibeleTransaction: doc,
          });
        });
      });
    // console.log(this.state.alltransactions);
  };

  fetchMoreTrasactions = async (searchText) => {
    let enterText = searchText.toLowerCase().split('');
    const { lastVisibeleTransaction, alltransactions } = this.state;
    if (enterText[0] === 'b') {
      const query = await db
        .collection('transactions')
        .where('bookId', '==', searchText)
        .startAfter(lastVisibeleTransaction)
        .limit(10)
        .get();
      querry.docs.map((doc) => {
        this.setState({
          alltransactions: [...this.state.alltransactions, doc.data()],
          lastVisibeleTransaction: doc,
        });
      });
    } else if (enteredtext[0] === 's') {
      const querry = await db
        .collection('transactions')
        .where('studentId', '==', searchText)
        .startAfter(lastVisibeleTransaction)
        .limit(10)
        .get();
      querry.docs.map((doc) => {
        this.setState({
          alltransactions: [...this.state.alltransactions, doc.data()],
          lastVisibeleTransaction: doc,
        });
      });
    }
  };

  handleSearch = async (text) => {
    var enteredtext = text.toLowerCase().split('');
    this.setState({
      alltransactions: [],
    });
    // console.log(enteredtext)
    if (enteredtext.length == 0) {
      // console.log('zyx');
      this.getTransactions();
    }
    if (enteredtext[0] == 'b') {
      db.collection('transactions')
        .where('bookId', '==', text)
        .get()
        .then((snapShot) => {
          snapShot.docs().map((doc) => {
            this.setState({
              alltransactions: [...this.state.alltransactions, doc.data()],
              lastVisibeleTransaction: doc,
            });
          });
        });
    } else if (enteredtext[0] == 's') {
      db.collection('transactions')
        .where('studentId', '==', text)
        .get()
        .then((snapShot) => {
          snapShot.docs().map((doc) => {
            this.setState({
              alltransactions: [...this.state.alltransactions, doc.data()],
              lastVisibeleTransaction: doc,
            });
          });
        });
    }
    // console.log(this.state.alltransactions);
  };

  renderItem = ({ item, i }) => {
    var date = item.date.toDate().toString().split(' ').splice(0, 4).join(' ');
    // console.log(date)
    var transactionType =
      item.transactionType === 'issued' ? 'issued' : 'returned';
    return (
      <View>
        <ListItem>
          <ListItem.Content>
            <ListItem.Title>{item.bookName}</ListItem.Title>
            <ListItem.Subtitle>{`this book ${transactionType} by ${item.studentName}`}</ListItem.Subtitle>
            <ListItem.Subtitle>{`date: ${date}`}</ListItem.Subtitle>
          </ListItem.Content>
        </ListItem>
      </View>
    );
  };
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.upperContainer}>
          <View style={styles.textinputContainer}>
            <TextInput
              placeholder="Search Trasactions"
              style={styles.textinput}
              onChangeText={(text) => {
                this.setState({
                  searchText: text,
                });
              }}
            />

            <TouchableOpacity
              style={styles.scanbutton}
              onPress={() => {
                this.handleSearch(this.state.searchText);
              }}>
              <Text style={styles.scanbuttonText}>search</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.lowerContainer}>
          <FlatList
            data={this.state.alltransactions}
            renderItem={this.renderItem}
            keyExtractor={(index, item) => index.toString()}
            onEndReached={() => {
              this.fetchMoreTrasactions(this.state.searchText);
            }}
            onEndReachedThreshold={0.6}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#5653D4' },
  upperContainer: { flex: 0.2, justifyContent: 'center', alignItems: 'center' },
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
  lowerContainer: { flex: 0.8, backgroundColor: '#FFFFFF' },
  title: { fontSize: 20, fontFamily: 'Rajdhani_600SemiBold' },
  subtitle: { fontSize: 16, fontFamily: 'Rajdhani_600SemiBold' },
  lowerLeftContaiiner: { alignSelf: 'flex-end', marginTop: -40 },
  transactionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  transactionText: { fontSize: 20, fontFamily: 'Rajdhani_600SemiBold' },
  date: { fontSize: 12, fontFamily: 'Rajdhani_600SemiBold', paddingTop: 5 },
});
