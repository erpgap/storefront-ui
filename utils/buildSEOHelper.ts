import type { Meta } from "@unhead/vue";

export interface SeoEntity {
    metaTitle?: string;
    metaDescription?: string;
    jsonLd?: string | object;
    metaKeyword?: string;
    metaImage?: string;
    name?: string;
    id?: string | number;
}

const validateSEO = (entity: SeoEntity, fullPath: string, entityType: string) => {
    const warnings = [];

    if (!entity?.metaTitle) {
        warnings.push(
            `[WARNING] - The ${entityType} from slug ${fullPath} does not have the metaTitle.`
        );
    }
    if (!entity?.metaDescription) {
        warnings.push(
            `[WARNING] - The ${entityType} from slug ${fullPath} does not have the metaDescription.`
        );
    }
    if (!entity?.jsonLd) {
        warnings.push(
            `[WARNING] - The ${entityType} from slug ${fullPath} does not have the jsonLd.`
        );
    }
    if (!entity?.metaKeyword) {
        warnings.push(
            `[WARNING] - The ${entityType} from slug ${fullPath} does not have the metaKeyword.`
        );
    }
    if (!entity?.metaImage) {
        warnings.push(
            `[WARNING] - The ${entityType} from slug ${fullPath} does not have the metaImage.`
        );
    }

    warnings.forEach((warning) => console.warn(warning));
};

const generateSeo = <T extends SeoEntity>(entity: T, entityType: string) => {
    const { href } = useRequestURL()

    validateSEO(entity, href, entityType);

    const defaultTitle =
        entity.metaTitle || entity.name || `${entityType} page`;

    return {
        title: defaultTitle,
        meta: [
            {
                hid: "title",
                name: "title",
                content: entity?.metaTitle || `${entity?.name} | ${entity?.id}`,
            },
            entity?.metaDescription && {
                hid: "description",
                name: "description",
                content: entity.metaDescription,
            },
            entity?.metaDescription && {
                hid: "og:description",
                name: "og:description",
                content: entity.metaDescription,
            },
            {
                hid: "og:title",
                name: "og:title",
                content: defaultTitle,
            },
            {
                hid: "twitter:title",
                name: "twitter:title",
                content: defaultTitle,
            },
            entity?.metaDescription && {
                hid: "twitter:description",
                name: "twitter:description",
                content: entity.metaDescription,
            },
        ].filter(Boolean) as Meta[],
        script: [
            entity?.jsonLd && {
                type: "application/ld+json",
                children: JSON.stringify(entity.jsonLd),
            },
        ].filter(Boolean),
        link: [
            {
                rel: "canonical",
                href
            },
        ],
    };
};

export default generateSeo;