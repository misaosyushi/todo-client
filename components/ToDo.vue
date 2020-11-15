<template>
  <v-data-table :headers="headers" :items="toDoList" :search="search" sort-by="deadlineDate" class="elevation-1">
    <template v-slot:top>
      <v-toolbar flat>
        <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details></v-text-field>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="800px">
          <template v-slot:activator="{ on, attrs }">
            <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on"> New ToDo </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="headline">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="editedItem.title" label="Title"></v-text-field>
                  </v-col>
                  <v-col cols="24" sm="12" md="8">
                    <v-text-field v-model="editedItem.detail" label="Detail"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-menu
                      v-model="menu"
                      :close-on-content-click="false"
                      :nudge-right="40"
                      transition="scale-transition"
                      offset-y
                      min-width="290px"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          v-model="editedItem.deadlineDate"
                          label="Deadline Date"
                          prepend-icon="mdi-calendar"
                          readonly
                          v-bind="attrs"
                          v-on="on"
                        ></v-text-field>
                      </template>
                      <v-date-picker v-model="editedItem.deadlineDate" @input="menu = false"></v-date-picker>
                    </v-menu>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-select v-model="editedItem.status" :items="statusList" label="Status" outlined></v-select>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="close"> Cancel </v-btn>
              <v-btn color="blue darken-1" text @click="save"> Save </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:item.status="{ item }">
      <v-chip :color="getStatus(item.status)" dark>
        {{ item.status }}
      </v-chip>
    </template>
    <template v-slot:item.actions="{ item }">
      <v-icon small class="mr-2" @click="editItem(item)"> mdi-pencil </v-icon>
      <v-icon small @click="deleteItem(item)"> mdi-delete </v-icon>
    </template>
    <template v-slot:no-data>
      <v-btn color="primary" @click="initialize"> Reset </v-btn>
    </template>
  </v-data-table>
</template>

<script>
const Status = {
  Todo: 'todo',
  InProgress: 'inProgress',
  Done: 'done',
}

export default {
  data: () => ({
    search: '',
    dialog: false,
    menu: false,
    headers: [
      {
        text: 'Title',
        align: 'start',
        value: 'title',
      },
      { text: 'Detail', value: 'detail' },
      { text: 'DeadlineDate', value: 'deadlineDate' },
      { text: 'Status', value: 'status' },
      { text: 'Actions', value: 'actions', sortable: false },
    ],
    toDoList: [],
    statusList: [Status.Todo, Status.InProgress, Status.Done],
    editedIndex: -1,
    editedItem: {
      id: '',
      title: '',
      detail: '',
      deadlineDate: '',
      status: '',
    },
    defaultItem: {
      id: '',
      title: '',
      detail: '',
      deadlineDate: '',
      status: '',
    },
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'New Item' : 'Edit Item'
    },
  },

  watch: {
    dialog(val) {
      val || this.close()
    },
  },

  created() {
    this.initialize()
  },

  methods: {
    async initialize() {
      this.toDoList = await this.$axios.$get('todo')
    },

    getStatus(status) {
      switch (status) {
        case Status.Done:
          return 'green'
        case Status.InProgress:
          return 'yellow'
        default:
          return 'orange'
      }
    },

    editItem(item) {
      this.editedIndex = this.toDoList.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },

    async deleteItem(item) {
      this.editedIndex = this.toDoList.indexOf(item)
      this.editedItem = Object.assign({}, item)
      await this.$axios.$delete(`/todo/${item.id}`)
      await this.initialize()
    },

    close() {
      this.dialog = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    async save() {
      const req = {
        title: this.editedItem.title,
        detail: this.editedItem.detail,
        deadlineDate: this.editedItem.deadlineDate,
        status: this.editedItem.status,
      }

      if (this.editedIndex > -1) {
        await this.$axios.$put(`/todo/${this.editedItem.id}`, req)
      } else {
        await this.$axios.$post('todo', req)
      }

      await this.initialize()
      this.close()
    },
  },
}
</script>
