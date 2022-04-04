<template>
  <div>
    <slot :click="() => settingsModal = true">
      <v-icon class="mx-2" @click="settingsModal=true">
        mdi-cog-outline
      </v-icon>
    </slot>
    <v-dialog v-model="settingsModal" width="90%" overlay-opacity=".9">
      <v-card
        v-if="settingsModal"
        width="100%"
        min-height="350px"
      >
        <div class="d-flex">
          <v-navigation-drawer
            left
            permanent
            height="90vh"
            style="background-color: #f7f6f3"
          >
            <div class=" advance-menu ">
              <v-list
                v-if="_isUIAllowed('treeViewProjectSettings')"
                dense
                :class="{ 'advanced-border': overShieldIcon }"
              >
                <v-list-item>
                  <v-list-item-title>
                    <!-- Settings -->
                    <span class="body-2 font-weight-medium grey--text  text-uppercase caption">{{ $t('activity.settings') }}</span>
                  </v-list-item-title>
                </v-list-item>
                <v-list-item-group v-model="activePage" color="x-active" mandatory>
                  <v-tooltip bottom>
                    <template #activator="{ on }">
                      <v-list-item
                        v-t="['settings:team-auth']"
                        value="roles"
                        dense
                        class="body-2 nc-settings-teamauth"
                        v-on="on"
                      >
                        <v-list-item-icon>
                          <v-icon small>
                            mdi-account-group
                          </v-icon>
                        </v-list-item-icon>
                        <!-- Team & Auth -->
                        <v-list-item-title>
                          <span :class="{'font-weight-medium': activePage === 'roles', 'font-weight-regular':activePage !=='roles'}">{{
                            $t('title.team&auth')
                          }}</span>
                        </v-list-item-title>
                      </v-list-item>
                    </template>
                    <!-- Roles & Users Management -->
                    {{ $t('title.rolesUserMgmt') }}
                  </v-tooltip>

                  <template v-if="_isUIAllowed('treeViewProjectSettings')">
                    <v-tooltip bottom>
                      <template #activator="{ on }">
                        <v-list-item
                          v-t="['settings:appstore']"
                          dense
                          class="body-2 nc-settings-appstore"
                          value="appStore"
                          v-on="on"
                        >
                          <v-list-item-icon>
                            <v-icon small>
                              mdi-storefront-outline
                            </v-icon>
                          </v-list-item-icon>
                          <!-- App Store -->
                          <v-list-item-title>
                            <span :class="{'font-weight-medium': activePage === 'appStore', 'font-weight-regular':activePage !=='appStore'}">{{
                              $t('title.appStore')
                            }}</span>
                          </v-list-item-title>
                        </v-list-item>
                      </template>
                      <!-- App Store -->
                      {{ $t('title.appStore') }}
                    </v-tooltip>

                    <v-tooltip bottom>
                      <template #activator="{ on }">
                        <v-list-item
                          v-t="['settings:proj-metadata']"
                          dense
                          class="body-2 nc-settings-projmeta"
                          value="disableOrEnableModel"
                          v-on="on"
                        >
                          <v-list-item-icon>
                            <v-icon small>
                              mdi-table-multiple
                            </v-icon>
                          </v-list-item-icon>
                          <!-- Project Metadata -->
                          <v-list-item-title>
                            <span :class="{'font-weight-medium': activePage === 'disableOrEnableModel', 'font-weight-regular':activePage !=='disableOrEnableModel'}">{{
                              $t('title.projMeta')
                            }}</span>
                          </v-list-item-title>
                        </v-list-item>
                      </template>
                      <!-- Meta Management -->
                      {{ $t('title.metaMgmt') }}
                    </v-tooltip>

                    <v-tooltip bottom>
                      <template #activator="{ on }">
                        <v-list-item
                          v-t="['settings:audit']"
                          dense
                          class="body-2 nc-settings-audit"
                          value="audit"
                          v-on="on"
                        >
                          <v-list-item-icon>
                            <v-icon small>
                              mdi-notebook-outline
                            </v-icon>
                          </v-list-item-icon>
                          <!-- Project Metadata -->
                          <v-list-item-title>
                            <span :class="{'font-weight-medium': activePage === 'audit', 'font-weight-regular':activePage !=='audit' }">{{
                              $t('title.audit')
                            }}</span>
                          </v-list-item-title>
                        </v-list-item>
                      </template>
                      <!-- Meta Management -->
                      {{ $t('title.auditLogs') }}
                    </v-tooltip>
                  </template>
                </v-list-item-group>
              </v-list>
              <!--              <v-divider />-->

              <!--              <v-list v-if="_isUIAllowed('previewAs') || previewAs" dense>
                <v-list-item>
                  &lt;!&ndash; Preview as &ndash;&gt;
                  <span class="body-2 font-weight-medium">{{ $t('activity.previewAs') }}</span>
                  <v-icon small class="ml-1">
                    mdi-drama-masks
                  </v-icon>
                &lt;!&ndash;                <v-icon small>mdi-menu-down</v-icon>&ndash;&gt;
                </v-list-item>

                <v-list dense>
                  &lt;!&ndash;              <v-list-item v-for="role in rolesList" @click="setPreviewUSer(role.title)" :key="role.title">&ndash;&gt;
                  &lt;!&ndash;                <v-icon small class="mr-1" :color="role.title === previewAs ? 'x-active' : ''">{{ roleIcon[role.title] }}</v-icon>&ndash;&gt;
                  &lt;!&ndash;                <span class="caption text-capitalize"&ndash;&gt;
                  &lt;!&ndash;                      :class="{ 'x-active&#45;&#45;text' : role.title === previewAs }">{{ role.title }}</span>&ndash;&gt;
                  &lt;!&ndash;              </v-list-item>&ndash;&gt;
                  <div class="mx-4 d-flex align-center mb-2">
                    <template v-for="(role, i) in rolesList">
                      &lt;!&ndash;                  <span v-if="i" vertical :key="i" class="mx-2 caption grey&#45;&#45;text">or</span>&ndash;&gt;
                      <v-divider v-if="i" :key="i" vertical class="mx-2 caption grey&#45;&#45;text" />
                      <div
                        :key="role.title"
                        :class="`pointer text-center nc-preview-${role.title}`"
                        @click="setPreviewUSer(role.title)"
                      >
                        <v-icon
                          small
                          class="mr-1"
                          :color="role.title === previewAs ? 'x-active' : ''"
                        >
                          {{ roleIcon[role.title] }}
                        </v-icon>
                        <span
                          class="caption text-capitalize"
                          :class="{ 'x-active&#45;&#45;text': role.title === previewAs }"
                        >{{ role.title }}</span>
                      </div>
                    </template>
                  </div>
                  <template v-if="previewAs">
                    &lt;!&ndash;                <v-divider></v-divider>&ndash;&gt;
                    <v-list-item @click="setPreviewUSer(null)">
                      <v-icon small class="mr-1">
                        mdi-close
                      </v-icon>
                      &lt;!&ndash; Reset Preview &ndash;&gt;
                      <span class="caption nc-preview-reset">{{ $t('activity.resetReview') }}</span>
                    </v-list-item>
                  </template>
                </v-list>
              </v-list>-->

            <!--  <v-list dense>

                <v-list-item>
                  <v-list-item-title>
                    <span class="body-2 grey&#45;&#45;text">Community</span>
                    <v-icon color="red" class=" heart-anim" small> mdi-heart</v-icon>
                  </v-list-item-title>
                </v-list-item>
                <v-list-item dense v-on="on" @click="openLink('https://github.com/sponsors/nocodb')" class="body-2">
                  <v-list-item-icon>

                  </v-list-item-icon>
                  <v-list-item-title><span class="font-weight-regular caption">Sponsor Us</span></v-list-item-title>

                </v-list-item>
                <v-list-item dense v-on="on" @click="openLink('https://github.com/sponsors/nocodb')" class="body-2">
                  <v-list-item-icon>
                    <v-icon color="red" class=" heart-anim" small> mdi-heart</v-icon>
                  </v-list-item-icon>
                  <v-list-item-title><span class="font-weight-regular caption">Sponsor Us</span></v-list-item-title>

                </v-list-item>
                <v-list-item dense v-on="on" @click="openLink('https://github.com/sponsors/nocodb')" class="body-2">
                  <v-list-item-icon>
                    <v-icon color="red" class=" heart-anim" small> mdi-heart</v-icon>
                  </v-list-item-icon>
                  <v-list-item-title><span class="font-weight-regular caption">Sponsor Us</span></v-list-item-title>

                </v-list-item>
              </v-list>-->
            </div>
          </v-navigation-drawer>
          <v-container class="flex-grow-1 py-9 px-15" style="max-height: 90vh; overflow-y: auto">
            <div v-if="activePage === 'audit'" style="height:100%">
              <audit-tab />
            </div>
            <div
              v-else-if="activePage === 'meta'"
            >
              <xc-meta />
            </div>
            <div
              v-else-if="activePage === 'roles'"
            >
              <auth-tab
                v-if="_isUIAllowed('team-auth')"
              />
            </div>
            <div
              v-else-if="activePage === 'disableOrEnableModel'"
            >
              <disable-or-enable-models
                v-if="_isUIAllowed('project-metadata')"
              />
            </div>
            <app-store v-else />
          </v-container>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import AppStore from '~/components/project/appStore'
import DisableOrEnableModels from '~/components/project/projectMetadata/disableOrEnableModels'
import AuthTab from '~/components/authTab'
import XcMeta from '~/components/project/settings/xcMeta'
import AuditTab from '~/components/project/auditTab'

export default {
  name: 'SettingsModal',
  components: { AuditTab, XcMeta, AuthTab, DisableOrEnableModels, AppStore },
  data: () => ({
    settingsModal: false,
    activePage: 'role'
  })
}
</script>

<style scoped lang="scss">
::v-deep{
  .v-list-item__icon{
    margin-right: 0 !important;
  }
}

</style>
