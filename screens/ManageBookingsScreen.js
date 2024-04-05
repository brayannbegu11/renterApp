
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

const ManageBookingsScreen = ({ navigation }) => {
    const [bookingsList, setBookingsList] = useState([]);

    const retrieveFromDb = async () => {
        const user = auth.currentUser;

        if (user !== null) {
            const q = query(collection(db, "bookings"), where("renter", "==", user.email));

            onSnapshot(q, (querySnapshot) => {
                const resultsFromFirestore = [];
                querySnapshot.forEach((doc) => {
                    resultsFromFirestore.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });

                setBookingsList(resultsFromFirestore);
            });
        } else {
            alert("Not logged in");
        }
    }

    useEffect(() => {
        retrieveFromDb()
    }, []);

    const renderBookingItem = ({ item }) => (
        <View style={styles.bookingItem}>
            <Text style={styles.vehicleName}>{item.vehicleName}</Text>
            <Image source={{ uri: item.vehiclePhoto }} style={styles.vehicleImage} />
            <View style={styles.details}>
                <Text style={styles.detailText}>Booking Date: {item.bookingDate}</Text>
                <Text style={styles.detailText}>License Plate: {item.licensePlate}</Text>
                <Text style={styles.detailText}>Electric range: {item.electricRange}</Text>
                <Text style={styles.detailText}>Price: ${item.rentalPrice}</Text>
                <View style={styles.ownerInfo}>
                    <Text style={styles.ownerName}>Owner: {item.ownerName}</Text>
                    <Image source={{ uri: 'https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA4L2pvYjEwMzQtZWxlbWVudC0wNi0zOTcucG5n.png' }} style={styles.ownerPhoto} />
                </View>
                <Text style={[styles.status, item.bookingStatus === 'Approved' ? styles.confirmed : "", item.bookingStatus === 'Pending' ? styles.pending : "", item.bookingStatus === 'Declined' ? styles.declined : ""]}>
                    {item.bookingStatus}
                </Text>
                {item.status === 'Confirmed' && <Text style={styles.confirmationCode}>Confirmation Code: {item.confirmationCode}</Text>}
            </View>
        </View>
    );

    return (
        <FlatList
            data={bookingsList}
            renderItem={renderBookingItem}
            keyExtractor={item => item.id}
        />
    );
};

const styles = StyleSheet.create({
    bookingItem: {
        backgroundColor: '#fff',
        borderRadius: 8,
        marginVertical: 8,
        marginHorizontal: 16,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
    },
    vehicleName: {
        fontSize: 18,
        fontWeight: 'bold',
        margin: 10,
    },
    vehicleImage: {
        width: '100%',
        height: 200,
    },
    details: {
        padding: 10,
    },
    detailText: {
        fontSize: 16,
        marginVertical: 2,
    },
    ownerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    ownerName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 10,
    },
    ownerPhoto: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    status: {
        marginTop: 10,
        padding: 5,
        borderRadius: 5,
        overflow: 'hidden',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    confirmed: {
        backgroundColor: '#C8E6C9',
        color: '#2E7D32',
    },
    pending: {
        backgroundColor: '#FFF9C4',
        color: '#F9A825',
    },
    declined: {
        backgroundColor: '#FFCDD2',
        color: '#C62828',
    },
    confirmationCode: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1B5E20',
        marginTop: 10,
    },
});


export default ManageBookingsScreen;


