import { CardsSection } from '.stackbit/models/CardsSection';
import { createClient } from 'contentful';
import * as types from 'types';
const TYPE_ABSTRACT = 'abstractCard';

const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined;

export async function resolveReferences(page: types.Page) {
    let referenceIds: string[] = [];

    page.sections?.map(section => {
        //TODO: Make this generic to handle resolution of all external references
        if(section.type == "CardsSection") {
            let cardSection: types.CardsSection = section;

            cardSection.items?.map(card => {
                if(card.abstractReference?.refId) {
                    referenceIds.push(card.abstractReference.refId);
                }
            })
        }
    })

    let abstractCards = await getAbstractEntries(referenceIds);

    page.sections?.map(section => {
        //TODO: Make this generic to handle resolution of all external references
        if(section.type == "CardsSection") {
            let cardSection: types.CardsSection = section;
            cardSection.items?.map(card => {
                abstractCards?.map(abstractCard => {
                    if(abstractCard._id == card.abstractReference?.refId) {
                        card.abstractReferenceContent = abstractCard;
                    }
                })
            })
        }
    })

    return page;
}

export async function getEntries(type: any, queryParams: any = {}) {
    const client = createClient({
        accessToken: isDev ? 
            process.env.CONTENTFUL_ABSTRACT_PREVIEW_TOKEN! : 
            process.env.CONTENTFUL_ABSTRACT_DELIVERY_TOKEN!,
        space: process.env.CONTENTFUL_ABSTRACT_SPACE_ID!,
        host: isDev ? 'preview.contentful.com' : 'cdn.contentful.com'
    });

    return client.getEntries({
        content_type: type,
        ...queryParams,
        include: 10,
    })
    .then((response) => {
        return response.items.map(mapEntry)
    });
}

export async function getAbstractEntries(ids: string[]) {
    return getEntries(TYPE_ABSTRACT, {
        'sys.id[in]': ids.join(", ")
    }).then((items) => items.length > 0 ? items : []);
}

export async function getAbstractEntry(id: any) {
    return getEntries(TYPE_ABSTRACT, {
        'fields.id': id
    }).then((items) => items.length > 0 ? items[0] : null);
}

function mapEntry(entry: any) {
    return {
        _id: entry.sys?.id,
        _type: entry.sys?.contentType?.sys.id || entry.sys?.type,
        fields: Object.entries(entry.fields).reduce((acc: any, [key, value]) => {
            acc[key] = parseField(value);
            return acc;
        }, {}),
    };
}

function parseField(value: any) {
    if (typeof value === 'object' && value.sys) {
        return mapEntry(value);
    }

    if (Array.isArray(value)) {
        return value.map(mapEntry);
    }

    return value;
}
