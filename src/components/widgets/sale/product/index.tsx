import { PickerItem, PickerPropType, ProductPacksType, ProductType } from '@/components/types';

import React, { useEffect, useState } from 'react';
import { Dimensions, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AutoComplete from '../../autocomplete';
import { routeConfig } from '@/constant/route';
import Styles from '@/components/styles';
import { Dropdown } from 'react-native-element-dropdown';
import { Colors } from '@/constant/color';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { get } from '@/data/api.handler';
import { scaledFontSize } from '@/components/functions';


const { width, height } = Dimensions.get('window');
function ProductPicker({ id, product, products, items, setItems }: ProductPacksType) {

    const [loading, setLoading] = useState(false);

    const user = useSelector((state: any) => state.user)
    // const [items, setItems] = useState<PickerItem[]>([]);
    const packs = Array.from({ length: 50 }, (_, i) => { return { id: i, title: i } })



    const handleChange = (key: string, value: any) => {

        if (id > 0 && id <= products.length) {
            const updatedProduct = { ...product, [key]: value, }
            items[id - 1] = updatedProduct;
            setItems(items);
        }
    }

    const renderDropdown = (key: string, title: string, data: any, value: any, value_key: string) => {
        return <View style={[Styles.flexColumn, { gap: 2 }]}>
            <Text style={[Styles.text, { fontSize: scaledFontSize(16) }]}>{title}</Text>

            <Dropdown
                style={[Styles.field, { height: 40 }]}
                keyboardAvoiding
                data={data}
                mode='modal'

                containerStyle={[{
                    maxHeight: height * .7,
                    width: width * .7
                }]}
                itemTextStyle={[{ color: Colors.dark, textAlign: 'center' }]}
                selectedTextStyle={[
                    { paddingHorizontal: 10, color: Colors.placeholder },
                ]}
                placeholderStyle={[
                    { paddingHorizontal: 10, color: Colors.placeholder },
                ]}
                search
                maxHeight={100}
                labelField="title"
                valueField={value_key}
                placeholder={"Select product"}
                value={value}
                searchPlaceholder="Search..."
                onChange={(item: any) => {
                    handleChange(key, item[value_key]);
                }}
            />

        </View>
    }



    return (
        <SafeAreaProvider>
            {loading ? <ActivityIndicator size={40} color={Colors.secondary} />
                : <View style={[Styles.flexRow, Styles.productBox,]}>
                    <View style={[{ flexGrow: 1, }]}>
                        {renderDropdown("product_id", "Product " + id, products, product.product_id, 'product_id')}
                    </View>
                    <View style={[{ flexGrow: .2, }]}>
                        {renderDropdown('packs', "Number of Packs", packs, { id: product.packs, value: product.packs, }, 'id')}
                    </View>

                </View>}
        </SafeAreaProvider>
    );
}

export default ProductPicker;