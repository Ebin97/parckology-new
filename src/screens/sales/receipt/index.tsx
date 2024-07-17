import { scaledFontSize } from '@/components/functions';
import Layout from '@/components/layout';
import Styles from '@/components/styles';
import CustomButton from '@/components/widgets/button';
import CustomCard from '@/components/widgets/card';
import { Colors } from '@/constant/color';
import { routeConfig } from '@/constant/route';
import { destroy, get } from '@/data/api.handler';
import { getUser } from '@/data/store.data';
import useTrans from '@/locale';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Image, ImageBackground, ScrollView, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Button, FAB, Icon, List, Text } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const baseHeight = 800; // Width on which the font size is designed
const baseImageHeight = 700;
const { width, height } = Dimensions.get("screen");
const baseIWidth = width * .8;
const scaleFactor = height / baseHeight;

function ReceiptsScreen({ navigation }: { navigation: any }) {
    const { language, translate } = useTrans();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const scaleFactor = height / baseHeight;
    const scaledHeight = baseImageHeight * scaleFactor;
    const scaledFontSize = (size: number) => Math.round(size * scaleFactor);
    const scaledWidth = baseIWidth * scaleFactor;
    const [popup, setPopup] = useState<boolean>(false);
    const [selectedItem, setSelectedItem] = useState<any>();
    const [page, setPage] = useState(1);
    const [paginate, setPaginate] = useState<any>({});

    const loadData = async (newPage: number) => {
        setLoading(true);
        try {
            const user = await getUser();
            const res = await get(routeConfig.sales + "?page=" + newPage, user?.token);
            if (res && res.status_code == 200) {
                if (newPage <= 1) {
                    setData(res.data);
                } else {
                    setData([
                        ...data,
                        ...res.data
                    ])
                }
                setPage(res.page ?? 1)
                setPaginate({
                    total: res.total,
                    page: res.page,
                    perPage: res.perPage
                })
            }
            setLoading(false);
        } catch (e) {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            setLoading(true);
            const user = await getUser();
            const res = await destroy(routeConfig.sales + '/' + id, user?.token);
            console.log(JSON.stringify(res))
            if (res && res.status_code == 200) {
                loadData(1)
            }
            setLoading(false);
        } catch (e) {
            console.log(e)
            setLoading(false);
        }
    }
    const deleteReceipt = (item: any) => {

        Alert.alert(translate('warning'), translate('are_you_sure'), [
            {
                text: 'Cancel',
                onPress: () => { },
                style: 'cancel'
            },
            {
                text: 'Ok',
                onPress: () => { handleDelete(item.id) }
            }
        ])
    }

    const showPopup = (item: any) => {
        setSelectedItem(item)
        setPopup(true);
    }
    const loadMore = () => {
        let temp = page + 1;
        setPage(temp)
        loadData(temp);
    }
    const handleRefresh = () => {
        loadData(1)
    }

    useEffect(() => {
        loadData(1);
    }, []);

    return (
        <>
            <Layout appbar bottomBar navigation={navigation} refresh={handleRefresh} >
                <SafeAreaProvider>

                    <View style={{ position: 'relative', flex: 1, minHeight: height }}>

                        <View style={[Styles.flexColumn, { marginVertical: scaledHeight * 0.02, gap: 15, marginBottom: scaledHeight * 0.1 }]}>
                            <View style={[Styles.center]}>
                                <Text style={[Styles.text, { fontSize: scaledFontSize(25), fontWeight: 'bold' }]}>All Receipts</Text>
                            </View>
                            {data.length > 0 ?
                                <>
                                    {data.map((item, key) => {
                                        return <CustomCard key={key} style={{
                                            maxWidth: '100%', flex: 1, paddingHorizontal: 10, paddingTop: 0,
                                            paddingBottom: 10,
                                            marginHorizontal: scaledFontSize(15),
                                            backgroundColor: Colors.receipt,
                                        }} loading={false}>
                                            <View style={[Styles.flexColumn, {
                                                gap: 6,
                                                position: 'relative'
                                            }]}>

                                                <Text style={{ fontSize: scaledFontSize(14), fontWeight: 'bold', color: Colors.dark, alignSelf: 'center' }}>#{item.receipt_number}</Text>

                                                <View style={[Styles.flexSpaceBetween]}>
                                                    <Text style={{ fontSize: scaledFontSize(13), fontWeight: 'bold', color: Colors.receiptText, alignSelf: 'flex-start' }}>Date of Receipt:</Text>
                                                    <Text style={{ fontSize: scaledFontSize(13), color: Colors.dark, alignSelf: 'flex-start' }}>{item.receipt_date}</Text>
                                                </View>
                                                <View style={[Styles.flexSpaceBetween]}>
                                                    <Text style={{ fontSize: scaledFontSize(13), fontWeight: 'bold', color: Colors.receiptText, alignSelf: 'flex-start' }}>No. of Packs:</Text>
                                                    <Text style={{ fontSize: scaledFontSize(13), color: Colors.dark, alignSelf: 'flex-start' }}>{item.packs}</Text>
                                                </View>
                                                <View style={[Styles.flexSpaceBetween]}>
                                                    <Text style={{ fontSize: scaledFontSize(13), fontWeight: 'bold', color: Colors.receiptText, alignSelf: 'flex-start' }}>Status:</Text>
                                                    <Text style={{ fontSize: scaledFontSize(13), color: item.status == "Approved" ? Colors.green : Colors.red, fontWeight: '500', alignSelf: 'flex-start' }}>{item.status}</Text>
                                                </View>
                                                <View style={[Styles.flexSpaceBetween]}>
                                                    <Text style={{ fontSize: scaledFontSize(13), fontWeight: 'bold', color: Colors.receiptText, alignSelf: 'flex-start' }}>Awarded Points:</Text>
                                                    <Text style={{ fontSize: scaledFontSize(13), color: item.status == "Approved" ? Colors.dark : Colors.red, fontWeight: '500', alignSelf: 'flex-start' }}>{item.status == "Approved" ? item.points : "-"}</Text>
                                                </View>
                                                <View style={[Styles.flexSpaceBetween, { gap: 5 }]}>
                                                    {item.status == "Rejected" ?
                                                        <Button
                                                            style={[Styles.WhiteButton,]}
                                                            compact
                                                            onPress={() => {
                                                                showPopup(item);
                                                            }}>
                                                            <Text style={{ ...Styles.btnText, color: Colors.primary, textAlign: 'center', fontSize: scaledFontSize(12) }}>{translate('reasons')}</Text>
                                                        </Button>
                                                        : null}
                                                    <Button
                                                        style={[Styles.WhiteButton,]}
                                                        compact
                                                        onPress={() => {
                                                            deleteReceipt(item)
                                                        }}>
                                                        <Text style={{ ...Styles.btnText, color: Colors.red, textAlign: 'center', fontSize: scaledFontSize(12), }}>{translate('delete')}</Text>
                                                    </Button>
                                                </View>

                                            </View>
                                        </CustomCard>

                                    })}


                                </> : <View style={[Styles.center, { flex: 1, marginTop: 10 }]}>
                                    <Text style={[Styles.text, { fontSize: scaledFontSize(18), color: Colors.white, fontWeight: 'bold' }]}>No receipts have been submitted.</Text>

                                </View>}

                            {loading ? (
                                <View>
                                    <ActivityIndicator size={40} color={Colors.secondary} />
                                </View>
                            ) : (paginate.total > paginate.perPage * paginate.page) ? <View style={[Styles.center]}>
                                <CustomButton title='Load more' style={[{ width: 200 }]} action={() => { }} color={Colors.white} loading={loading} />
                            </View> : null}
                        </View>

                    </View>
                </SafeAreaProvider>
            </Layout >
            <FAB style={[Styles.fab]} color={Colors.dark} rippleColor={Colors.white} size='medium' variant='surface' icon={'plus'} onPress={() => {
                navigation.replace('Sales')
            }} />
            {
                popup ? <View style={[{ backgroundColor: Colors.placeholder, position: 'absolute', justifyContent: 'center', alignItems: 'center', height: height, left: 0, right: 0, top: 0, bottom: 0, borderWidth: 1 },]}>
                    <View style={[]}>

                        <ImageBackground
                            source={require('@assets/images/quiz_bg.png')}
                            resizeMode="stretch"
                            style={[
                                {
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    position: 'relative',
                                    // width: width * 0.8,
                                    width: scaledWidth * .8,
                                    maxWidth: 700,
                                    marginHorizontal: scaledFontSize(16),
                                    height: scaledHeight * 0.5,
                                    padding: 0.15,
                                },
                            ]}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => {
                                    setPopup(false)
                                }}
                                style={{ position: 'absolute', top: 0, right: 0, zIndex: 10 }}>
                                <Image
                                    source={require('@assets/images/close.png')}
                                    style={{ width: scaledFontSize(50), height: scaledFontSize(50) }}
                                />
                            </TouchableOpacity>

                            <View style={{ position: 'relative' }}>
                                <View
                                    style={[
                                        Styles.quiz,
                                        {
                                            paddingVertical: 60,
                                            gap: scaledFontSize(20)
                                        },
                                    ]}>
                                    <Text style={
                                        [
                                            Styles.quizTitle,
                                            { fontSize: scaledFontSize(18), fontWeight: 'bold' }
                                        ]
                                    }>{translate('reason_of_rejection')}</Text>
                                    <ScrollView style={[]}>
                                        {selectedItem?.reasons.map((item: any, key: number) => {
                                            return <Text key={key} style={
                                                [
                                                    Styles.quizTitle,
                                                    { fontSize: scaledFontSize(16), paddingVertical: 2 }
                                                ]
                                            } >- {item}</Text>
                                        })}
                                    </ScrollView>
                                    <View style={[Styles.flex]}>

                                        <Button
                                            style={[Styles.WhiteButton,]}
                                            compact
                                            onPress={() => {
                                                deleteReceipt(selectedItem)
                                            }}>
                                            <Text style={{ ...Styles.btnText, color: Colors.red, textAlign: 'center', fontSize: scaledFontSize(15) }}>{translate('delete')}</Text>
                                        </Button>
                                    </View>

                                </View>

                            </View>
                        </ImageBackground>
                    </View >

                </View > : null
            }
        </>

    );

}

export default ReceiptsScreen;