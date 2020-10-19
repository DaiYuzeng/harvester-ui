<script>
import Footer from '@/components/form/Footer';
import CreateEditView from '@/mixins/create-edit-view';
import FileSelector, { createOnSelected } from '@/components/form/FileSelector';

export default {
  name: 'EditSSH',

  components: {
    Footer,
    FileSelector
  },

  mixins: [CreateEditView],

  props: {
    value: {
      type:     Object,
      required: true,
    }
  },

  data() {
    let spec = this.value.spec;

    if ( !this.value.spec ) {
      spec = {};
      this.value.spec = spec;
      this.value.metadata = { name: '' };
    }

    return {
      needsValidate: true,

      form: {
        name:      this.value.metadata.name,
        publicKey: this.value.spec.publicKey || ''
      },

      rules: {
        publicKey: [
          { required: true, message: this.$store.getters['i18n/t']('validation.required', { key: 'SSH-Key' }) },
        ]
      },
    };
  },

  watch: {
    'form.publicKey'(neu) {
      this.value.spec.publicKey = neu;

      const splitSSH = neu.split(/\s+/);

      if (splitSSH.length === 3) {
        if (splitSSH[2].includes('@')) {
          if (splitSSH[2].split('@')) {
            this.form.name = splitSSH[2].split('@')[0];
          }
        }
      }
    }
  },

  methods: {
    onKeySelected: createOnSelected('publicKey'),
    afterValidate() {
      this.value.metadata.name = this.form.name;
    }
  },
};
</script>

<template>
  <div>
    <a-card class="mt-20 keypair-card">
      <div class="header mb-20">
        <FileSelector v-if="isCreate" class="btn btn-sm bg-primary mt-10" label="Read From File" accept=".pub" @selected="onKeySelected" />
      </div>
      <a-form-model ref="form" :model="form" :rules="rules" layout="vertical">
        <a-form-model-item v-if="mode!=='view'" label="Name" prop="name">
          <a-input
            v-model="form.name"
          />
        </a-form-model-item>
        <a-form-model-item label="SSH-Key" prop="publicKey">
          <a-textarea
            v-model="form.publicKey"
            :auto-size="{ minRows: 5 }"
            :read-only="mode === 'view'"
          />
        </a-form-model-item>
      </a-form-model>
      <Footer :mode="mode" :errors="errors" @save="beforeSave" @done="done" />
    </a-card>
  </div>
</template>

<style lang="scss">
.keypair-card {
  .header {
    display: flex;
    justify-content: flex-end;
  }

  .resize {
    resize: auto;
  }
  .row .labeled-input span {
    word-break: break-word;
  }
}
</style>
