import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import Canvas from 'react-native-canvas';
import { IndenticonLib } from './Identiconlib';

interface Props {
    value: string;
    style?: {[key: string]: any};
    size?: number;
}

const Identicon = ({ value, style, size = 45 }: Props) => {
    const handleCanvas = useRef(null);

    useEffect(() => {
        if (handleCanvas.current) {IndenticonLib.generateSync(handleCanvas.current, { id: value, size }, size);}
    }, []);

    return (
        <View style={[{width: size, height: size, borderRadius: 30, overflow: 'hidden'}, style]}>
            <Canvas ref={handleCanvas}/>
        </View>
    );
};

export default Identicon;
