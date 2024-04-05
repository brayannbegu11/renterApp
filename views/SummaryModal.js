import { Button, Modal, StyleSheet, Text, TouchableOpacity, View, Image, Alert } from "react-native";
import { auth, db } from "../firebaseConfig";
import { addDoc, collection } from "firebase/firestore";

export const VehicleSummaryModal = ({ visible, onClose, vehicle }) => {
    const {
        vehicleName,
        vehiclePhoto,
        seatingCapacity,
        electricRange,
        totalRange,
        licensePlate,
        coordinates,
        rentalPrice,
        owner,
    } = vehicle
    function handleRandomDate(start, end) {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
    }

    const handleBookNow = async () => {
        const user = auth.currentUser
        let pfp = ''


        if (user !== null) {
            if (user.email === 'renter1@gmail.com') pfp = 'https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTAxLzI3OS1wYWkxNTc5LW5hbS1qb2IxNTI5LnBuZw.png'
            if (user.email === 'renter2@gmail.com') pfp = 'https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA4L2pvYjExMjAtZWxlbWVudC0xOS5wbmc.png'

            try {
                const bookingsRef = collection(db, 'bookings');
                const bookingDate = handleRandomDate(new Date(), new Date(2025, 5, 1)).toISOString()

                const bookingToInsert = {
                    vehicleName,
                    vehiclePhoto,
                    seatingCapacity,
                    electricRange,
                    totalRange,
                    licensePlate,
                    coordinates,
                    rentalPrice,
                    owner,
                    renterPhoto: pfp,
                    bookingDate,
                    renter: user.email,
                    bookingStatus: 'Pending',
                };

                await addDoc(bookingsRef, bookingToInsert);

                Alert.alert("Booking Created", "You must wait to receive approval before the booking can be confirmed");
            } catch (error) {
                console.error("Error adding document: ", error);
                Alert.alert("Error", "There was an error creating your booking.");
            }
        } else {
            Alert.alert("Not signed in", "You must be signed in to create a listing.");
        }
    }
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    {vehicle.vehiclePhoto && (
                        <Image source={{ uri: vehicle.vehiclePhoto }} style={styles.vehicleImage} />
                    )}
                    <Text style={styles.modalTitle}>{vehicle.vehicleName}</Text>
                    <Text style={styles.modalText}>Price: ${vehicle.rentalPrice}</Text>
                    <Text style={styles.modalText}>Seating capacity: {vehicle.seatingCapacity}</Text>
                    <Button title="BOOK NOW" onPress={handleBookNow} />
                    <TouchableOpacity style={styles.closeModalButton} onPress={onClose}>
                        <Text style={styles.closeButtonTitle}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 15,
        alignItems: "center",
        shadowColor: "#000",
        width: '100%',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    vehicleImage: {
        width: 300,
        height: 180,
        borderRadius: 10,
        marginBottom: 10,
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center",
        fontSize: 16,
    },
    modalTitle: {
        marginBottom: 10,
        textAlign: "center",
        fontSize: 18,
        fontWeight: "bold",
    },
    closeModalButton: {
        backgroundColor: "#f05454",
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        marginTop: 10,
    },
    closeButtonTitle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
    },
});
