import { HCI } from '@/config/types';
import {
  DESCRIPTION,
  ANNOTATIONS_TO_IGNORE_REGEX,
  HCI_IMAGE_SOURCE
} from '@/config/labels-annotations';

export default {
  availableActions() {
    let out = this._standardActions;
    const toFilter = ['goToEditYaml'];

    out = out.filter( A => !toFilter.includes(A.action));

    return [
      {
        action:     'createFromImage',
        enabled:    this.isReady,
        icon:       'icon icon-fw icon-spinner',
        label:      this.t('harvester.action.createVM'),
      },
      ...out
    ];
  },

  createFromImage() {
    return () => {
      const router = this.currentRouter();

      router.push({
        name:   `c-cluster-product-resource-create`,
        params: { resource: HCI.VM },
        query:  { image: this.nameDisplay }
      });
    };
  },

  nameDisplay() {
    return this.spec?.displayName;
  },

  isReady() {
    const Initialized = this.getStatusConditionOfType('Initialized');

    return Initialized?.status === 'True';
  },

  stateDisplay() {
    const Initialized = this.getStatusConditionOfType('Initialized');

    return this.isReady ? 'Active' : Initialized?.message ? 'Failed' : 'In-progress';
  },

  resourcesStatus() {
    const imageList = this.$rootGetters['cluster/all'](HCI.IMAGE);

    let warningCount = 0;
    let errorCount = 0;

    imageList.forEach((item) => {
      const status = item.getStatusConditionOfType('imported')?.status;

      if (status === 'False') {
        errorCount += 1;
      } else if (status === 'Unknown') {
        warningCount += 1;
      }
    });

    return {
      warningCount,
      errorCount
    };
  },

  warningCount() {
    return this.resourcesStatus.warningCount;
  },

  errorCount() {
    return this.resourcesStatus.errorCount;
  },

  imageSource() {
    return this.getAnnotationValue(HCI_IMAGE_SOURCE) || 'url'; // url is default source
  },

  annotationsToIgnoreRegexes() {
    return [DESCRIPTION].concat(ANNOTATIONS_TO_IGNORE_REGEX);
  },

  customValidationRules() {
    const out = [];

    if (this.imageSource === 'url') {
      const urlFormat = {
        nullable:       false,
        path:           'spec.url',
        validators:     ['imageUrl'],
      };

      const urlRequired = {
        nullable:       false,
        path:           'spec.url',
        required:       true,
        translationKey: 'harvester.imagePage.url'
      };

      out.push(urlFormat, urlRequired);
    }

    if (this.imageSource === 'file') {
      // File is required!
    }

    return [
      {
        nullable:       false,
        path:           'spec.displayName',
        required:       true,
        minLength:      1,
        maxLength:      63,
        translationKey: 'generic.name'
      },
      {
        nullable:       false,
        path:           'spec.displayName',
        required:       true,
        translationKey: 'generic.name'
      },
      ...out
    ];
  },
};
