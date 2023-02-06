import path from 'path';
import dotenv from 'dotenv';

import { Author } from './.stackbit/models/Author';
import { Button } from './.stackbit/models/Button';
import { Card } from './.stackbit/models/Card';
import { CardsSection } from './.stackbit/models/CardsSection';
import { Config } from './.stackbit/models/Config';
import { Footer } from './.stackbit/models/Footer';
import { Header } from './.stackbit/models/Header';
import { HeroSection } from './.stackbit/models/HeroSection';
import { Image } from './.stackbit/models/Image';
import { Link } from './.stackbit/models/Link';
import { Page } from './.stackbit/models/Page';
import { ThemeStyle } from './.stackbit/models/ThemeStyle';
import { defineStackbitConfig } from '@stackbit/types';
import { FileSystemContentSource } from './content-source/fs-content-source';
import { ContentfulContentSource } from '@stackbit/cms-contentful';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const sbConfig = defineStackbitConfig({
    stackbitVersion: '~0.6.0',
    ssgName: 'nextjs',
    nodeVersion: '16',
    contentSources: [
        new FileSystemContentSource({
            rootDir: __dirname,
            contentDir: 'content',
            models: [Author, Button, Card, CardsSection, Config, Footer, Header, HeroSection, Image, Link, Page, ThemeStyle],
            assets: {
                referenceType: 'static',
                staticDir: 'public',
                uploadDir: 'images',
                publicPath: '/'
            }
        }),
        new ContentfulContentSource({
            spaceId: process.env.CONTENTFUL_ABSTRACT_SPACE_ID!,
            environment: process.env.CONTENTFUL_ABSTRACT_ENVIRONMENT || 'master',
            previewToken: process.env.CONTENTFUL_ABSTRACT_PREVIEW_TOKEN!,
            accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!
        }),
    ],
    modelExtensions: [
        {
            name: 'Card',
            srcType: 'fs',
            fields: [
                {
                    name: 'abstractReference',
                    type: 'cross-reference',
                    models: [
                      {
                        modelName: 'abstractCard',
                        srcType: 'contentful'
                      }
                    ]
                }
            ]
        }
    ]
});

export default sbConfig;
