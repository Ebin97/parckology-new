import Styles from '@/components/styles';
import { IDType } from '@/components/types';
import { Colors } from '@/constant/color';
import React from 'react';
import { Dimensions, ImageBackground, TouchableOpacity, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';

const baseHeight = 800; // Width on which the font size is designed
const { width, height } = Dimensions.get("screen");
const scaleFactor = height / baseHeight;

const baseIWidth = width * .8;

function ID({ title, imageSource, uploadID, removeID }: IDType) {
    const scaledFontSize = (size: number) => Math.round(size * scaleFactor);

    const scaledWidth = baseIWidth * scaleFactor;

    return (
        <View style={[Styles.receiptBg, Styles.padding, { width: "100%" }]}>
            {!imageSource ? (
                <TouchableOpacity
                    onPress={uploadID}>
                    <View style={[Styles.dashBorder, Styles.center,]}>

                        <View style={[Styles.center, Styles.flexRow, { gap: 5, }]}>
                            <Icon
                                source={"image-plus"}
                                size={scaledFontSize(35)}
                                color={Colors.primary}
                            />
                            <Text style={[Styles.primaryBoldText, { fontSize: scaledFontSize(12),textAlign:'center',flexWrap:'wrap',maxWidth:200 }]}>{title}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            ) : (
                <View style={[]}>
                    <TouchableOpacity
                        style={Styles.replaceIcon}
                        onPress={removeID}>
                        <Icon
                            source={'close'}
                            size={30}
                            color={Colors.white}
                        />
                    </TouchableOpacity>

                    <ImageBackground
                        resizeMode={'contain'}
                        style={{ height: 150, width: '100%' }}
                        source={{ uri: imageSource }}></ImageBackground>
                </View>
            )}
        </View >
    );
}

export default ID;