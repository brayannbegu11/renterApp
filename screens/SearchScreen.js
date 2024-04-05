import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import MapView, { Marker } from 'react-native-maps';

import { StyleSheet, Text, View, Button, TouchableOpacity } from 'react-native';
import { VehicleSummaryModal } from '../views/SummaryModal';



export const SearchScreen = ({ navigation }) => {

    const [currentCity, setCurrentCity] = useState('')
    const [currentCoords, setCurrentCoords] = useState({ lat: 0, lng: 0 })
    const [vehicles, setVehicles] = useState([]);
    const [filteredVehicles, setFilteredVehicles] = useState([]);

    const [selectedVehicle, setSelectedVehicle] = useState(null)
    const [isLoading, setIsLoading] = useState(true);

    const getCurrentLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            alert(`Permission to access location was denied`)
            return
        }

        let location = await Location.getCurrentPositionAsync();
        const newCoords = {
            lat: location.coords.latitude,
            lng: location.coords.longitude
        };
        setCurrentCoords(newCoords);
        setIsLoading(false);
    };

    const fetchAllVehicles = () => {
        const vehiclesColRef = collection(db, "vehicles");
        const unsubscribe = onSnapshot(vehiclesColRef, (snapshot) => {
            const vehicles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setVehicles(vehicles);
        }, (error) => {
            console.error("Error fetching vehicles:", error);
        });

        return unsubscribe;
    };

    const filterVehiclesByCity = async () => {
        const _filteredVehicles = [];
        for (const vehicle of vehicles) {
            try {
                const coords = {
                    latitude: parseFloat(vehicle.coordinates.lat),
                    longitude: parseFloat(vehicle.coordinates.lng),
                }

                const postalAddresses = await Location.reverseGeocodeAsync(coords, {})

                const result = postalAddresses[0]
                if (result === undefined) {
                    alert("No results found.")
                    return
                }

                const vehicleCity = result.city;
                if (vehicleCity === currentCity) {
                    _filteredVehicles.push(vehicle);
                }
            } catch (err) {
                console.log("Inside for", err)
            }
        }
        console.log(_filteredVehicles)
        setFilteredVehicles(_filteredVehicles);
    };


    const doReverseGeocode = async () => {
        try {
            const coords = {
                latitude: currentCoords.lat,
                longitude: currentCoords.lng,
            };
            const postalAddresses = await Location.reverseGeocodeAsync(coords, {});

            const result = postalAddresses[0];
            if (result === undefined) {
                alert("No results found.");
                return;
            }

            console.log(result);

            setCurrentCity(result.city);
        } catch (err) {
            console.log(err);
        }
    };


    const handleLogout = async () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    }


    useEffect(() => {
        getCurrentLocation()
    }, [])
    useEffect(() => {
        if (currentCoords.lat !== 0 && currentCoords.lng !== 0) {
            doReverseGeocode();
        }
    }, [currentCoords]);
    useEffect(() => {
        const unsubscribe = fetchAllVehicles();

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (currentCity && vehicles.length > 0) {
            filterVehiclesByCity();
        }
    }, [currentCity, vehicles]);

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
            ),
            headerTitle: "Search",
        });
    }, [navigation]);



    return (
        <View style={styles.container}>
            {!isLoading && (
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: currentCoords.lat,
                        longitude: currentCoords.lng,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                >
                    {filteredVehicles.length > 0 && filteredVehicles.map((vehicle) => (
                        <Marker
                            key={vehicle.vehicleName}
                            coordinate={{
                                latitude: parseFloat(vehicle.coordinates.lat),
                                longitude: parseFloat(vehicle.coordinates.lng),
                            }}
                            title={vehicle.vehicleName}
                            description={`Price: $${vehicle.rentalPrice}`}
                            onPress={() => setSelectedVehicle(vehicle)}
                        >
                            <View style={styles.marker}>
                                <Text style={styles.text}>${vehicle.rentalPrice}</Text>
                            </View>
                        </Marker>
                    ))}
                </MapView>
            )}
            {selectedVehicle && (
                <VehicleSummaryModal
                    visible={!!selectedVehicle}
                    onClose={() => setSelectedVehicle(null)}
                    vehicle={selectedVehicle}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    marker: {
        backgroundColor: '#FFF',
        padding: 5,
        borderRadius: 5,
        borderColor: '#DDD',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    text: {
        color: '#333',
        fontWeight: 'bold',
    },
    logoutButton: {
        marginRight: 10,
        backgroundColor: 'red', // Example color
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
    },
    logoutButtonText: {
        color: '#fff',
    },
})
