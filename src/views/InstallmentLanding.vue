<template>
    <div class="main">
        <div class="box d-flex flex-column flex-md-row">

            <div class="content">
                <img src="../assets/logo.svg" alt="خانه طلا">
                <h3 class="my-3">فرم درخواست خرید اقساطی</h3>
                <p class="my-3">لطفا برای استفاده از خرید اقساطی خانه طلا، فرم زیر را پر کنید</p>
            </div>
            <v-form v-model="isValid" class="w-100" @submit.prevent="submitForm">
                <v-container>
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="formInfo.firstName" label="نام" variant="outlined"
                                :rules="NameinputRules"></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="formInfo.lastName" label="نام خانوادگی" variant="outlined"
                                :rules="LastNameinputRules"></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="formInfo.phoneNumber" label="شماره موبایل" variant="outlined"
                                :rules="mobileRules" @input="NumberInput"></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="formInfo.nationalCode" label="کد ملی" variant="outlined"
                                :rules="nationalCodeRules"></v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <v-select v-model="formInfo.category" :items="items" label="دسته بندی" variant="outlined"
                                :rules="categoryRules" item-title="label"
                                item-value="value" chips multiple></v-select>
                        </v-col>
                        <v-col cols="12">
                            <v-btn type="submit" size="large" block color="#af8b4a" :disabled="!isValid">ثبت</v-btn>
                        </v-col>
                    </v-row>
                </v-container>
            </v-form>
        </div>
    </div>

    <v-dialog max-width="500" v-model="confirmDialog">
        <v-card title="فرم خرید شما ثبت شد">
            <v-card-text>
                از همراهی شما سپاسگزاریم، به زودی با شما تماس خواهیم گرفت
            </v-card-text>

            <div class="d-flex justify-center">
                <img src="../assets/done.svg" alt="تکمیل فرم" width="80" class="my-3">
            </div>

            <v-card-actions>
                <v-spacer></v-spacer>

                <v-btn text="بستن" @click="closeForm"></v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-alert
      v-model="errorAlert"
      border="start"
      close-label="Close Alert"
      color="error"
      title="خطا"
      variant="tonal"
      class="error"
      closable
    >
     {{ errorMsg }}
    </v-alert>
</template>

<script setup>
import axios from 'axios';
import { ref, watch } from 'vue';
const confirmDialog = ref(false);
const ConfirmLoading = ref(false);
const errorMsg = ref('');
const errorAlert = ref(false);
const formInfo = ref({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    nationalCode: '',
    category: [],
})
const items = ref([
{ label: "النگو", value: "0" },
  { label: "دستبند", value: "1" },
  { label: "گوشواره", value: "2" },
  { label: "زنجیر", value: "3" },
  { label: "مدال", value: "4" },
  { label: "سرویس", value: "5" },
]);
const isValid = ref(false);
watch(
    () => formInfo.value.category,
    (val) => {
        if (val.length > 2) {
            formInfo.value.category.pop();
        }
    },
    { deep: true }
);

const mobileRules = [
    (v) => !!v || 'شماره همراه نمی‌تواند خالی باشد',
    (v) => /^\d{11}$/.test(v) || 'شماره همراه باید 11 رقم باشد',
    (v) => v.startsWith('09') || 'شماره همراه باید با 09 شروع شود',
];

const NameinputRules = [
    (v) => !!v || 'نام نمی‌تواند خالی باشد',
];

const LastNameinputRules = [
    (v) => !!v || 'نام خانوادگی نمی‌تواند خالی باشد',
];

const nationalCodeRules = [
    (v) => !!v || 'کد ملی الزامی است',
    (v) => /^\d{10}$/.test(v) || 'کد ملی باید ۱۰ رقم باشد',
    (v) => {
        if (!/^\d{10}$/.test(v)) return true;

        const check = +v[9];
        const sum = v.split('').slice(0, 9).reduce((acc, x, i) => acc + (+x * (10 - i)), 0) % 11;
        return (sum < 2 && check === sum) || (sum >= 2 && check + sum === 11) || 'کد ملی نامعتبر است';
    }
]

const categoryRules = [
    (v) => (v.length > 0) || "حداقل یک دسته بندی را انتخاب کنید!",
]

const NumberInput = () => {
    formInfo.value.phoneNumber = formInfo.value.phoneNumber
        .replace(/[٠-٩۰-۹]/g, (d) =>
            String.fromCharCode(d.charCodeAt(0) - (d.charCodeAt(0) >= 0x06F0 ? 1728 : 1584))
        )
        .replace(/\D/g, '')
        .slice(0, 11);
}

const submitForm = async () => {
    try {
      ConfirmLoading.value = true;
      const response = await axios.post("https://gateway.khaneetala.ir/v1/installment/create", formInfo.value, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    confirmDialog.value = true;
    console.log("Success:", response.data);
  } catch (error) {
    errorMsg.value = error.response.data.error || 'خطایی رخ داده است!';
    setTimeout(() => {
       errorAlert.value = true;
    }, 5000)
  } finally {
    ConfirmLoading.value = false;
  }
};

const closeForm = () => {
    confirmDialog.value = false;
    formInfo.value.firstName = null;
    formInfo.value.lastName = null;
    formInfo.value.phoneNumber = null;
    formInfo.value.nationalCode = null;
    formInfo.value.category = [];
}

</script>

<style scoped>
.main {
    min-height: 100vh;
    padding: 1rem;
    background-color: rgb(255 251 233);
}


.error{
    position: absolute;
    bottom: 0;
    right: 0;
}


@media(min-width:768px) {
    .main {
        min-height: 100vh;
        padding: 5rem;
    }

    .box .content {
        margin-top: 5rem;
    }
}

.box {
    box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.1);
    border-radius: 20px;
    padding: 5rem 1rem;
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: space-between;
    background-color: #fff;
}

.box .content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.box .content img {
    margin-bottom: 1rem;
}

.box .content p {
    text-align: center;
}
</style>