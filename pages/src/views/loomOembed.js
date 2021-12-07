import React, { useEffect, useState } from "react";
import { isSupported } from "@loomhq/loom-sdk";
import { oembed } from "@loomhq/loom-embed";

export default function LoomOembed(props) {
    const { sharedUrl } = props;
    const [ videoHTML, setVideoHTML ] = useState("");

    useEffect(() => {
        async function setupLoom() {

            const { supported, error } = await isSupported();

            if (!supported) {
                console.warn(`Error setting up Loom: ${error}`);
                return;
            }

            const { html } = await oembed(sharedUrl);
            setVideoHTML(html);
        }
        
        setupLoom();
        
    });

    return (
        <>
            test {sharedUrl} test
            <div dangerouslySetInnerHTML={{ __html: videoHTML }}></div>
        </>
    );
};
